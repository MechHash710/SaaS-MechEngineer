import React from 'react';
import { cn } from '../../lib/utils';

export interface ColumnDef<T> {
  key: string;
  header: string | React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  emptyMessage = "Nenhum dado encontrado.", 
  className 
}: DataTableProps<T>) {

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-slate-200 shadow-sm", className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  scope="col" 
                  className={cn("px-6 py-3", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 text-slate-600">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-8 text-center text-slate-500 italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      className={cn("px-6 py-4", col.className)}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
