import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, Layers } from 'lucide-react';

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
      // Cast Array.from result to File[] to ensure correct typing for filter and onFileSelect
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
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out
        ${isDragging 
          ? 'border-primary bg-emerald-50 scale-[1.01]' 
          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-emerald-100' : 'bg-gray-100'}`}>
          {isProcessing ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <Upload className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-medium text-gray-900">
            {isProcessing ? 'Analyzing images...' : 'Drop up to 5 images here'}
          </p>
          {!isProcessing && (
            <p className="text-sm text-gray-500">
              or click to browse from your computer
            </p>
          )}
        </div>

        {!isProcessing && (
          <div className="flex items-center space-x-2 text-xs text-gray-400 mt-4">
            <ImageIcon className="h-4 w-4" />
            <span>Supports JPG, PNG, WEBP</span>
            <span className="mx-2">•</span>
            <Layers className="h-4 w-4" />
            <span>Max 5 images</span>
          </div>
        )}
      </div>
    </div>
  );
};