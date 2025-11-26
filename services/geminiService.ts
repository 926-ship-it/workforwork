import { GoogleGenAI } from "@google/genai";
import { ExtractedDataRow, ExtractionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractDataFromImage = async (base64Image: string, mimeType: string): Promise<ExtractionResult> => {
  // Explicitly define the headers requested by the user
  const targetHeaders = ["序号", "平台", "昵称", "链接", "账号类型", "粉丝数（W）", "国家/地区"];

  try {
    const prompt = `
      Analyze the provided image containing a list or table of personal/influencer information.
      Extract the data into a valid JSON array of objects.
      
      STRICTLY extract ONLY the following columns (headers). Do not include any other columns.
      
      Target Headers & Extraction Rules:
      1. "序号" (No.): The row number or index.
      2. "平台" (Platform): The social media platform name (e.g., TikTok, Instagram, YouTube, Douyin, Red/Xiaohongshu).
      3. "昵称" (Nickname): The user's display name. 
         - CLEANING RULE: Remove any handle/ID that usually starts with '@' or follows the name. 
         - Example: "Twistedfate & Jesus @TwistedFatee" -> extract only "Twistedfate & Jesus".
         - Example: "John Doe @johndoe123" -> extract only "John Doe".
      4. "链接" (Link): IMPORTANT. Do not just look for text. You MUST GENERATE the direct profile URL based on the 'Platform' and the 'Nickname' (or unique ID if visible). 
         - Example: If Platform is TikTok and ID/Name is 'user123', output 'https://www.tiktok.com/@user123'.
         - Example: If Platform is Instagram, output 'https://www.instagram.com/user123'.
         - Example: If Platform is YouTube, output 'https://www.youtube.com/@user123'.
         - If the specific ID is not clear, use the best guess based on the nickname.
      5. "账号类型" (Account Type): The category of the account. IMPORTANT: You MUST output this value in Simplified Chinese. 
         - Translate if necessary (e.g., 'Fashion' -> '时尚', 'Beauty' -> '美妆', 'Funny' -> '搞笑', 'Tech' -> '科技').
      6. "粉丝数（W）" (Fans in 10k): Extract the numeric value converted to units of 10,000 (Wan). 
         - Example: If image says "1000", output "0.1". 
         - Example: If image says "10万" or "100k", output "10". 
         - Output ONLY the number.
      7. "国家/地区" (Country/Region): The location if available.
      
      Requirements:
      1. The keys of the objects MUST be exactly: ${targetHeaders.map(h => `"${h}"`).join(", ")}.
      2. If a specific field is not found for a row, set the value to an empty string "".
      3. Output ONLY the raw JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data returned from AI");
    }

    let rawData: any[] = [];
    try {
      rawData = JSON.parse(jsonText);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(rawData)) {
      throw new Error("AI response was not an array");
    }

    // Filter and sanitize data to strictly match targetHeaders
    // This removes any extra hallucinated columns and ensures strict schema
    const data: ExtractedDataRow[] = rawData.map(row => {
      const cleanRow: ExtractedDataRow = {};
      targetHeaders.forEach(header => {
        // Use the value if it exists, otherwise empty string
        let val = row[header];
        if (val === null || val === undefined) {
          val = "";
        }
        cleanRow[header] = val;
      });
      return cleanRow;
    });

    return {
      data,
      headers: targetHeaders,
    };

  } catch (error) {
    console.error("Error extracting data:", error);
    throw error;
  }
};