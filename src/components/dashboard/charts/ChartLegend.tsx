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
          className="flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-gray-50 p-2 rounded-md"
          onClick={() => onStatusSelect(status.name.toLowerCase())}
        >
          <div 
            className="w-3 h-3 rounded-full transition-transform duration-200 hover:scale-110" 
            style={{ backgroundColor: status.color }}
          />
          <span className="flex-1 text-sm text-gray-600">
            {status.name}
          </span>
          <span className="font-semibold text-sm text-gray-900">
            {status.value}
          </span>
        </div>
      ))}
    </div>
  );
};