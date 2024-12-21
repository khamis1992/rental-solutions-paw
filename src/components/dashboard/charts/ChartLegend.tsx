import React from 'react';

interface ChartLegendProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  onStatusSelect: (status: string) => void;
}

export const ChartLegend = ({ data, onStatusSelect }: ChartLegendProps) => {
  return (
    <div className="w-[200px] space-y-3 py-4">
      {data?.map((status, index) => (
        <div 
          key={index} 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
          onClick={() => onStatusSelect(status.name.toLowerCase())}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: status.color }}
          />
          <span className="flex-1 text-sm">
            {status.name}
          </span>
          <span className="font-semibold text-sm">
            {status.value}
          </span>
        </div>
      ))}
    </div>
  );
};