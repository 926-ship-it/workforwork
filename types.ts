export interface ExtractedDataRow {
  [key: string]: string | number | boolean | null;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface ExtractionResult {
  data: ExtractedDataRow[];
  headers: string[];
}
