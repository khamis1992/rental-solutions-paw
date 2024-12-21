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
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xl font-bold">{primaryStatus?.value}</span>
        <span className="text-xs">{primaryStatus?.name}</span>
      </div>
      <ChartContainer config={config}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={1}
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltipContent
                    className="bg-background border-border"
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