import React from 'react';
import { ExtractedDataRow } from '../types';

interface DataTableProps {
  data: ExtractedDataRow[];
  headers: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, headers }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[800px]">
      <div className="overflow-auto custom-scrollbar flex-grow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 bg-slate-50">
                #
              </th>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-50"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-emerald-50/30 transition-colors duration-150 group even:bg-slate-50/40"
              >
                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-400 font-mono group-hover:text-emerald-600">
                  {String(rowIndex + 1).padStart(2, '0')}
                </td>
                {headers.map((header) => {
                   const value = row[header];
                   const isLink = header === "链接" && typeof value === 'string' && value.startsWith('http');
                   
                   return (
                    <td key={`${rowIndex}-${header}`} className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-700">
                      {isLink ? (
                        <a 
                          href={value as string} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:text-emerald-700 hover:underline truncate max-w-[200px] inline-block align-bottom"
                          title={value as string}
                        >
                          {value}
                        </a>
                      ) : (
                        value?.toString() || <span className="text-slate-300 text-xs">--</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-xs text-slate-400 text-right">
        Total Rows: {data.length}
      </div>
    </div>
  );
};