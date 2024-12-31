import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
  onExport: () => void;
}

export const RevenueChart = ({ data, onExport }: RevenueChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No revenue data available for the selected period.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
          />
          <YAxis
            className="text-xs"
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => label}
            contentStyle={{ 
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)'
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#4ade80"
            strokeWidth={2}
            dot={false}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};