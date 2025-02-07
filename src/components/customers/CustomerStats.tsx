
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, UserPlus, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const CustomerStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["customer-stats"],
    queryFn: async () => {
      // Get customers with active agreements
      const { data: activeCustomers, error: activeError } = await supabase
        .from("profiles")
        .select("id, leases!inner(status)")
        .eq("role", "customer")
        .eq("leases.status", "active");

      // Get new customers in last 30 days
      const { data: newCustomers, error: newError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer")
        .eq("status", "pending_review")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get pending review customers
      const { data: pendingCustomers, error: pendingError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer")
        .eq("status", "pending_review");

      if (activeError || newError || pendingError) throw new Error("Failed to fetch customer stats");

      return {
        active: activeCustomers?.length || 0,
        new: newCustomers?.length || 0,
        pending: pendingCustomers?.length || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Active Customers",
      value: stats?.active || 0,
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Currently active agreements",
    },
    {
      title: "New Customers",
      value: stats?.new || 0,
      icon: UserPlus,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Joined in the last 30 days",
    },
    {
      title: "Pending Review",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Awaiting verification",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statCards.map((stat) => (
        <Card 
          key={stat.title} 
          className="border shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-full transition-all duration-300 group-hover:scale-110", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
