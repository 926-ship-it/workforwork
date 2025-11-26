import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { DataTable } from './components/DataTable';
import { Button } from './components/Button';
import { extractDataFromImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { exportToExcel } from './utils/excelUtils';
import { ExtractedDataRow, ProcessingStatus } from './types';
import { Download, RotateCcw, AlertCircle, FileText, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [data, setData] = useState<ExtractedDataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('extracted_data');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    if (files.length > 5) {
      setError("Please upload a maximum of 5 images at a time.");
      setStatus('error');
      return;
    }

    setStatus('processing');
    setError(null);
    setData([]);
    setHeaders([]);
    setCopySuccess(false);
    
    // Set previews
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
    
    // Set filename based on the first file + count if multiple
    const baseName = files[0].name.replace(/\.[^/.]+$/, "");
    setFileName(files.length > 1 ? `${baseName}_batch_${files.length}` : baseName);

    try {
      // Process all images in parallel
      const processingPromises = files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return await extractDataFromImage(base64, file.type);
      });

      const results = await Promise.all(processingPromises);

      // Aggregate data
      let aggregatedData: ExtractedDataRow[] = [];
      let detectedHeaders: string[] = [];

      results.forEach((result) => {
        if (result.headers.length > 0) {
          detectedHeaders = result.headers; // Assume headers are consistent across successful extractions
        }
        aggregatedData = [...aggregatedData, ...result.data];
      });

      // Post-process: Re-index the "序号" (No.) column
      const reIndexedData = aggregatedData.map((row, index) => ({
        ...row,
        "序号": index + 1
      }));

      setData(reIndexedData);
      setHeaders(detectedHeaders);
      setStatus('success');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process images. Please try again.");
      setStatus('error');
    }
  }, []);

  const handleExport = () => {
    // Pass headers to ensure correct column order in Excel
    exportToExcel(data, headers, `${fileName}_processed`);
  };

  const handleCopy = async () => {
    if (data.length === 0) return;

    // Create Tab-Separated Values (TSV) string for Excel compatibility
    const headerRow = headers.join('\t');
    const bodyRows = data.map(row => 
      headers.map(header => {
        const val = row[header];
        // Ensure content doesn't break format by replacing tabs/newlines within cells
        return val === null || val === undefined ? '' : String(val).replace(/\t/g, ' ').replace(/\n/g, ' ');
      }).join('\t')
    ).join('\n');

    const tsvContent = `${headerRow}\n${bodyRows}`;

    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setData([]);
    setHeaders([]);
    setError(null);
    setPreviewUrls([]);
    setCopySuccess(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Empty State */}
        {status === 'idle' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Turn Images into Excel Sheets
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload photos of lists, rosters, or tables. Our AI will identify individual records and organize them into a clean, downloadable spreadsheet.
              </p>
            </div>
            <UploadZone onFileSelect={handleFileSelect} isProcessing={false} />
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Processing {previewUrls.length} image{previewUrls.length > 1 ? 's' : ''}...</h2>
              <p className="text-gray-500">AI is extracting data and combining results.</p>
            </div>
             {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden h-32 w-full bg-gray-200 flex items-center justify-center">
                      <img src={url} alt={`Preview ${idx}`} className="h-full w-full object-contain opacity-50" />
                      {idx === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/80 p-4 rounded-full shadow-lg">
                              <RotateCcw className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="max-w-2xl mx-auto">
             <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
                <Button onClick={handleReset} variant="outline" icon={<RotateCcw className="h-4 w-4" />}>
                    Try Again
                </Button>
            </div>
          </div>
        )}

        {/* Success / Result State */}
        {status === 'success' && (
          <div className="space-y-6">
            
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">Extraction Complete</h3>
                    <p className="text-sm text-gray-500">{data.length} records found from {previewUrls.length} file{previewUrls.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="flex space-x-3 w-full sm:w-auto">
                <Button onClick={handleReset} variant="outline" className="flex-1 sm:flex-none">
                  New Scan
                </Button>
                <Button 
                  onClick={handleCopy} 
                  variant="outline" 
                  icon={copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  className="flex-1 sm:flex-none"
                >
                  {copySuccess ? 'Copied!' : 'Copy Data'}
                </Button>
                <Button onClick={handleExport} variant="primary" icon={<Download className="h-4 w-4" />} className="flex-1 sm:flex-none">
                  Download Excel
                </Button>
              </div>
            </div>

            {/* Content Split: Image Preview (Collapsible/Small) and Data Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Image Preview */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h4 className="font-medium text-gray-700 text-sm">Original Images ({previewUrls.length})</h4>
                        </div>
                        <div className="p-4 bg-gray-100 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="rounded border border-gray-200 bg-white p-1">
                                    <div className="text-xs text-gray-400 mb-1 px-1">Image {idx + 1}</div>
                                    <img 
                                        src={url} 
                                        alt={`Original ${idx + 1}`} 
                                        className="w-full h-auto object-contain rounded" 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Data Table */}
                <div className="lg:col-span-2">
                    <DataTable data={data} headers={headers} />
                </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default App;