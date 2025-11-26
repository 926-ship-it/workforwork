import React from 'react';
import { FileSpreadsheet, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center group cursor-default">
            <div className="relative flex-shrink-0 text-primary transition-transform duration-300 group-hover:scale-110">
              <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-20 rounded-full"></div>
              <FileSpreadsheet className="h-8 w-8 relative z-10" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Excel Extractor
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a 
              href="https://ai.google.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-500 hover:text-primary transition-colors duration-200 flex items-center gap-1"
            >
              Powered by Gemini
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};