import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, Layers, ScanLine } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (files: File[]) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = (Array.from(e.dataTransfer.files) as File[]).filter(file => file.type.startsWith('image/'));
      if (filesArray.length > 0) {
        onFileSelect(filesArray);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFileSelect(filesArray);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`relative group rounded-2xl p-12 text-center transition-all duration-300 ease-out border-2
        ${isDragging 
          ? 'border-primary bg-emerald-50/50 scale-[1.01] shadow-xl shadow-emerald-100/50' 
          : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/50 hover:shadow-lg hover:shadow-slate-200/40'
        }
        ${isProcessing ? 'opacity-80 pointer-events-none cursor-wait' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
        disabled={isProcessing}
      />
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 transition-opacity duration-300 ${isProcessing ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'}`}></div>
      </div>
      
      <div className="relative flex flex-col items-center justify-center space-y-6 z-0">
        <div className={`relative p-5 rounded-2xl transition-all duration-300 ${isDragging ? 'bg-emerald-100 rotate-3' : 'bg-slate-50 group-hover:bg-emerald-50 group-hover:-translate-y-1'}`}>
          {isProcessing ? (
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
                <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
            </div>
          ) : (
            <>
              <Upload className={`h-10 w-10 transition-colors duration-300 ${isDragging ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
              <div className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                  <ScanLine className="w-4 h-4 text-emerald-500" />
              </div>
            </>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-xl font-semibold text-slate-800 tracking-tight">
            {isProcessing ? 'AI is analyzing your data...' : 'Drop your table images here'}
          </p>
          {!isProcessing && (
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Drag & drop up to 5 screenshots, or click to browse.
              <br/>We'll extract the data into Excel for you.
            </p>
          )}
        </div>

        {!isProcessing && (
          <div className="flex flex-wrap justify-center items-center gap-4 mt-2">
             <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-500 border border-slate-200">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>JPG, PNG, WEBP</span>
             </div>
             <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-500 border border-slate-200">
                <Layers className="h-3.5 w-3.5" />
                <span>Max 5 Files</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};