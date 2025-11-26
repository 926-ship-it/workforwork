import React from 'react';
import { ExtractedDataRow } from '../types';

interface DataTableProps {
  data: ExtractedDataRow[];
  headers: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, headers }) => {
  if (data.length === 0) return null;

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                #
              </th>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {rowIndex + 1}
                </td>
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {row[header]?.toString() || <span className="text-gray-300 italic">--</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
