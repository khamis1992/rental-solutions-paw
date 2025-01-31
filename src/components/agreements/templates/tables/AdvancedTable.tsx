import React from 'react';
import { Table } from '@/types/agreement.types';
import { cn } from '@/lib/utils';

interface AdvancedTableProps {
  table: Table;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export const AdvancedTable = ({ table, dir = 'ltr', className }: AdvancedTableProps) => {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table 
        className="w-full border-collapse"
        style={{
          width: table.style.width,
          borderCollapse: table.style.borderCollapse,
          borderSpacing: table.style.borderSpacing,
          direction: dir
        }}
      >
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.cells.map((cell, cellIndex) => (
                <td 
                  key={cellIndex}
                  className="border border-gray-200 p-2"
                  style={{
                    fontWeight: cell.style.bold ? 'bold' : 'normal',
                    fontStyle: cell.style.italic ? 'italic' : 'normal',
                    textDecoration: cell.style.underline ? 'underline' : 'none',
                    fontSize: `${cell.style.fontSize}px`,
                    textAlign: cell.style.alignment,
                  }}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};