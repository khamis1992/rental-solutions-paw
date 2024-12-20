import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const CustomerStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["customer-stats"],
    queryFn: async () => {
      // Get total customers
      const { count: total } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq('role', 'customer');

      // Get new customers this month
      const { count: newThisMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq('role', 'customer')
        .gte(
          "created_at",
          new Date(new Date().setDate(1)).toISOString()
        );

      return {
        total: total || 0,
        newThisMonth: newThisMonth || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.newThisMonth}</div>
        </CardContent>
      </Card>
    </div>
  );
};