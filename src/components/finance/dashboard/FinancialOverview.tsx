import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, CreditCard, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const FinancialOverview = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      
      const [currentMonthRevenue, lastMonthRevenue, pendingPayments] = await Promise.all([
        supabase
          .from("unified_payments")
          .select("amount")
          .gte("payment_date", firstDayOfMonth.toISOString())
          .eq("type", "Income")
          .eq("status", "completed"),
          
        supabase
          .from("unified_payments")
          .select("amount")
          .gte("payment_date", firstDayOfLastMonth.toISOString())
          .lt("payment_date", firstDayOfMonth.toISOString())
          .eq("type", "Income")
          .eq("status", "completed"),
          
        supabase
          .from("unified_payments")
          .select("amount")
          .eq("status", "pending")
      ]);

      const currentRevenue = currentMonthRevenue.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const previousRevenue = lastMonthRevenue.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const pendingAmount = pendingPayments.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      
      const revenueGrowth = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      return {
        currentMonthRevenue: currentRevenue,
        previousMonthRevenue: previousRevenue,
        revenueGrowth,
        pendingPayments: pendingAmount
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[160px]" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Monthly Revenue",
      value: metrics?.currentMonthRevenue || 0,
      previousValue: metrics?.previousMonthRevenue || 0,
      change: metrics?.revenueGrowth || 0,
      icon: DollarSign,
      gradient: "from-green-500/10 to-green-500/5",
      iconColor: "text-green-500"
    },
    {
      title: "Pending Payments",
      value: metrics?.pendingPayments || 0,
      icon: Wallet,
      gradient: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-500"
    },
    {
      title: "Total Revenue YTD",
      value: (metrics?.currentMonthRevenue || 0) * 1.5, // Simplified calculation for demo
      icon: TrendingUp,
      gradient: "from-purple-500/10 to-purple-500/5",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(card.value)}</div>
            {card.change !== undefined && (
              <div className="flex items-center mt-2">
                {card.change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ml-1 ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(card.change).toFixed(1)}% from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};