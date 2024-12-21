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
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full">
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
                startAngle={90}
                endAngle={-270}
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
      <div className="flex flex-col items-center">
        <span className="text-2xl font-semibold">{primaryStatus?.value}</span>
        <span className="text-sm text-muted-foreground">{primaryStatus?.name}</span>
      </div>
    </div>
  );
};