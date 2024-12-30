import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "../charts/RevenueChart";
import { ExpenseChart } from "../charts/ExpenseChart";
import { Loader2 } from "lucide-react";

export const RevenueDashboard = () => {
  const queryClient = useQueryClient();

  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          lease:leases (
            agreement_type,
            vehicle:vehicles (
              make,
              model
            )
          )
        `)
        .order('created_at');

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Subscribe to payment changes
    const channel = supabase
      .channel('payment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        async (payload) => {
          console.log('Payment change detected:', payload);
          
          // Invalidate and refetch the financial metrics query
          await queryClient.invalidateQueries({ 
            queryKey: ['financial-metrics'] 
          });
          
          const eventMessages = {
            INSERT: 'New payment recorded',
            UPDATE: 'Payment updated',
            DELETE: 'Payment deleted'
          };
          
          toast.info(
            eventMessages[payload.eventType as keyof typeof eventMessages] || 'Payment record changed',
            {
              description: 'Financial dashboard has been updated.'
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Process data for visualizations
  const monthlyRevenue = financialData?.reduce((acc: any, payment) => {
    const date = new Date(payment.created_at);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        shortTerm: 0,
        leaseToOwn: 0,
        total: 0,
      };
    }

    const amount = payment.amount_paid || 0;
    acc[monthYear].total += amount;

    if (payment.lease?.agreement_type === 'short_term') {
      acc[monthYear].shortTerm += amount;
    } else {
      acc[monthYear].leaseToOwn += amount;
    }

    return acc;
  }, {});

  const revenueData = Object.values(monthlyRevenue || {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData} onExport={() => {}} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseChart data={[]} onExport={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
};