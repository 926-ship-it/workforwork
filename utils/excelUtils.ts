import * as XLSX from 'xlsx';
import { ExtractedDataRow } from '../types';

export const exportToExcel = (data: ExtractedDataRow[], headers: string[], fileName: string = 'extracted_data') => {
  if (!data || data.length === 0) return;

  // Use headers option to enforce specific column order
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};