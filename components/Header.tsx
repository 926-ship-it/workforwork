import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-primary">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Image to Excel</h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Data Extraction</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://ai.google.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Powered by Gemini
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
