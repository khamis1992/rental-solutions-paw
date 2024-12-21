import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  config: any;
  primaryStatus: {
    value: number;
    name: string;
  };
}

export const DonutChart = ({ data, config, primaryStatus }: DonutChartProps) => {
  return (
    <div className="relative flex-1">
      {/* Background circles for depth effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[280px] h-[280px] rounded-full bg-gray-50" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[260px] h-[260px] rounded-full bg-gray-100" />
      </div>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
        <span className="text-4xl font-bold text-gray-900">{primaryStatus?.value}</span>
        <span className="text-base text-gray-600 mt-1">{primaryStatus?.name}</span>
      </div>

      {/* Chart */}
      <ChartContainer config={config}>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={130}
              paddingAngle={2}
              dataKey="value"
              startAngle={180}
              endAngle={-180}
            >
              {data?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-all duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltipContent
                    className="bg-white border border-gray-200 shadow-lg"
                    payload={payload}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};