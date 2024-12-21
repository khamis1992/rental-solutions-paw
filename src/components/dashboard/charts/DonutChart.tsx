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
      {/* Pure white background circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[240px] h-[240px] rounded-full bg-white" />
      </div>
      
      {/* Center text - matched to design */}
      <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
        <span className="text-[48px] font-bold text-gray-900 leading-none">{primaryStatus?.value}</span>
        <span className="text-[16px] text-gray-600 mt-1">{primaryStatus?.name}</span>
      </div>

      {/* Chart - adjusted to match design proportions */}
      <ChartContainer config={config}>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={95}
              outerRadius={120}
              paddingAngle={1}
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
                    className="bg-white border border-gray-200"
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