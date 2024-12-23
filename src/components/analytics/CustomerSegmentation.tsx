import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const CustomerSegmentation = () => {
  const { data: segments, isLoading } = useQuery({
    queryKey: ["customer-segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_segments")
        .select(`
          *,
          customer:profiles (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Segments
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for visualization
  const scatterData = segments?.map((segment) => ({
    x: segment.features ? (segment.features as any).rental_frequency || 0 : 0,
    y: segment.features ? (segment.features as any).average_rental_duration || 0 : 0,
    segment: segment.segment_name,
    customer: segment.customer?.full_name,
  }));

  const segmentColors: { [key: string]: string } = {
    "High Value": "#0088FE",
    "Regular": "#00C49F",
    "Occasional": "#FFBB28",
    "New": "#FF8042",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Segments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Rental Frequency"
                unit=" rentals"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Average Duration"
                unit=" days"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded-lg shadow-lg">
                        <p className="font-medium">{data.customer}</p>
                        <p>Segment: {data.segment}</p>
                        <p>Rentals: {data.x}</p>
                        <p>Avg Duration: {data.y} days</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              {Object.keys(segmentColors).map((segment) => (
                <Scatter
                  key={segment}
                  name={segment}
                  data={scatterData?.filter((d) => d.segment === segment)}
                  fill={segmentColors[segment]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
