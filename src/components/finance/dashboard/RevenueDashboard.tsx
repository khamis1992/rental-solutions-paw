import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "../charts/RevenueChart";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MonthlyRevenue {
  month: string;
  shortTerm: number;
  leaseToOwn: number;
  total: number;
}

interface Payment {
  created_at: string;
  amount_paid: number;
  lease?: {
    agreement_type: 'short_term' | 'lease_to_own';
  };
}

export const RevenueDashboard = () => {
  const queryClient = useQueryClient();

  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      console.log("Fetching financial metrics...");
      try {
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

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        console.log("Financial data fetched:", data);
        return data as Payment[];
      } catch (err) {
        console.error("Error in financial metrics query:", err);
        throw err;
      }
    },
    retry: 2,
    onError: (err) => {
      console.error("Query error:", err);
      toast.error("Failed to load financial data", {
        description: "Please try again later or contact support if the problem persists."
      });
    }
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
          
          try {
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
          } catch (err) {
            console.error('Error handling payment change:', err);
            toast.error('Failed to update dashboard');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load financial data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Process data for visualizations
  const monthlyRevenue = financialData?.reduce<Record<string, MonthlyRevenue>>((acc, payment) => {
    const date = new Date(payment.created_at);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        shortTerm: 0,
        leaseToOwn: 0,
        total: 0
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

  const revenueData = Object.values(monthlyRevenue || {}).map(data => ({
    date: data.month,
    revenue: data.total
  }));

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
    </div>
  );
};