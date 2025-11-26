import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { DataTable } from './components/DataTable';
import { Button } from './components/Button';
import { extractDataFromImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { exportToExcel } from './utils/excelUtils';
import { ExtractedDataRow, ProcessingStatus } from './types';
import { Download, RotateCcw, AlertTriangle, FileText, Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

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
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
    
    const baseName = files[0].name.replace(/\.[^/.]+$/, "");
    setFileName(files.length > 1 ? `${baseName}_batch_${files.length}` : baseName);

    try {
      const processingPromises = files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return await extractDataFromImage(base64, file.type);
      });

      const results = await Promise.all(processingPromises);

      let aggregatedData: ExtractedDataRow[] = [];
      let detectedHeaders: string[] = [];

      results.forEach((result) => {
        if (result.headers.length > 0) {
          detectedHeaders = result.headers;
        }
        aggregatedData = [...aggregatedData, ...result.data];
      });

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
    exportToExcel(data, headers, `${fileName}_processed`);
  };

  const handleCopy = async () => {
    if (data.length === 0) return;

    const headerRow = headers.join('\t');
    const bodyRows = data.map(row => 
      headers.map(header => {
        const val = row[header];
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
    <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-200/20 blur-3xl"></div>
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/20 blur-3xl"></div>
      </div>

      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28 relative z-10">
        
        {/* Intro / Empty State */}
        {status === 'idle' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600 mb-4 animate-slide-up">
                <Sparkles className="w-4 h-4 text-emerald-500 mr-2" />
                <span>Powered by Gemini 2.5 AI</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Transform Image Tables into <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Actionable Excel Data</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Stop manual typing. Upload screenshots of influencer lists, rosters, or financial tables, and let AI structure them for you instantly.
              </p>
            </div>
            
            <div className="bg-white p-2 rounded-3xl shadow-soft">
               <UploadZone onFileSelect={handleFileSelect} isProcessing={false} />
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
               <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
               </div>
              <h2 className="text-2xl font-bold text-slate-900">Analyzing your data...</h2>
              <p className="text-slate-500">We're reading {previewUrls.length} image{previewUrls.length > 1 ? 's' : ''} and organizing the rows.</p>
            </div>
             {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 opacity-75">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-white shadow-sm border border-slate-100 group">
                      <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-slate-900/0 transition-colors"></div>
                      <img src={url} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white p-4 rounded-full shadow-lg">
                              <RotateCcw className="h-6 w-6 text-primary animate-spin" />
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
          <div className="max-w-xl mx-auto text-center space-y-6">
             <div className="rounded-2xl bg-red-50 p-6 border border-red-100 shadow-sm">
               <div className="flex flex-col items-center">
                  <div className="p-3 bg-red-100 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900">Processing Error</h3>
                  <p className="mt-2 text-sm text-red-700 text-center leading-relaxed">{error}</p>
               </div>
            </div>
            <Button onClick={handleReset} variant="outline" icon={<RotateCcw className="h-4 w-4" />}>
                Try Again
            </Button>
          </div>
        )}

        {/* Success / Result State */}
        {status === 'success' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-soft p-4 md:p-5 border border-slate-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-20 z-40 backdrop-blur-sm bg-white/90">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-2.5 rounded-lg border border-emerald-100">
                    <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Extraction Complete</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      Found <span className="text-emerald-600">{data.length}</span> rows in {previewUrls.length} file{previewUrls.length > 1 ? 's' : ''}
                    </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button onClick={handleReset} variant="ghost" className="flex-1 md:flex-none">
                  New Scan
                </Button>
                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                <Button 
                  onClick={handleCopy} 
                  variant="outline" 
                  icon={copySuccess ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  className="flex-1 md:flex-none"
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={handleExport} variant="primary" icon={<Download className="h-4 w-4" />} className="flex-1 md:flex-none shadow-emerald-500/20 shadow-lg">
                  Export Excel
                </Button>
              </div>
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Sources (Sticky Sidebar) */}
                <div className="lg:col-span-3 lg:sticky lg:top-44 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Source Images</h4>
                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{previewUrls.length}</span>
                        </div>
                        <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="group relative rounded-lg border border-slate-200 bg-white p-2 hover:border-emerald-300 transition-colors shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Img {idx + 1}</span>
                                      <ImageIcon className="w-3 h-3 text-slate-300" />
                                    </div>
                                    <div className="aspect-w-16 aspect-h-9 rounded overflow-hidden bg-slate-100">
                                      <img 
                                          src={url} 
                                          alt={`Original ${idx + 1}`} 
                                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                      />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Data Table */}
                <div className="lg:col-span-9">
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