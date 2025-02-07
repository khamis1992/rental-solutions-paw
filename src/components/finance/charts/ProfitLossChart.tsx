import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ProfitLossChartProps {
  data: Array<{
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export const ProfitLossChart = ({ data }: ProfitLossChartProps) => {
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="period" 
            tickFormatter={(value) => {
              const [year, month] = value.split('-');
              return `${new Date(parseInt(year), parseInt(month)-1).toLocaleString('default', { month: 'short' })} ${year}`;
            }}
          />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => {
              const [year, month] = label.split('-');
              return `${new Date(parseInt(year), parseInt(month)-1).toLocaleString('default', { month: 'long' })} ${year}`;
            }}
          />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit" name="Net Profit" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};