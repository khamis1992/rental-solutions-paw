import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface ActivityData {
  date: string;
  count: number;
}

export function UserActivityMonitor() {
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [activityType, setActivityType] = useState<string>("all");

  const { data: activityData, isLoading } = useQuery({
    queryKey: ['user-activities', timeRange, activityType],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: true });

      // Apply time range filter
      const now = new Date();
      let startDate;
      switch (timeRange) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      query = query.gte('created_at', startDate.toISOString());

      // Apply activity type filter
      if (activityType !== "all") {
        query = query.eq('action', activityType);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group data by date
      const groupedData = data.reduce((acc: { [key: string]: number }, item) => {
        const date = format(new Date(item.created_at), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Convert to array format for chart
      return Object.entries(groupedData).map(([date, count]) => ({
        date,
        count,
      }));
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Activity Monitor</CardTitle>
          <CardDescription>Loading activity data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Monitor</CardTitle>
        <CardDescription>Track user activities and system changes</CardDescription>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ChartContainer>
            <BarChart data={activityData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Bar
                dataKey="count"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
              <ChartTooltip />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}