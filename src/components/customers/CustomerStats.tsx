import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, UserCheck } from "lucide-react";
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
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Customers",
      value: stats?.total || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "New This Month",
      value: stats?.newThisMonth || 0,
      icon: UserPlus,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Customers",
      value: stats?.total - (stats?.newThisMonth || 0),
      icon: UserCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};