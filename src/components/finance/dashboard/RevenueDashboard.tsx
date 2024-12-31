import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RevenueChart } from "../charts/RevenueChart";
import { FinancialMetricsCard } from "../charts/FinancialMetricsCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  amount: number;
  created_at: string;
  status: string;
  type: 'Income' | 'Expense';
}

export const RevenueDashboard = () => {
  const queryClient = useQueryClient();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['financial-metrics'],
    queryFn: async () => {
      console.log("Fetching financial metrics...");
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('amount, created_at, status, type')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        console.log("Fetched payments:", data);
        return data as Payment[];
      } catch (err) {
        console.error("Failed to fetch financial metrics:", err);
        toast.error("Failed to load financial data", {
          description: "Please try again later or contact support if the problem persists."
        });
        throw err;
      }
    },
    retry: 2,
    meta: {
      errorMessage: "Failed to load financial data"
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('payment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log("Real-time payment update received:", payload);
          queryClient.invalidateQueries({ queryKey: ['financial-metrics'] });
          toast.success("Financial data updated", {
            description: "The dashboard has been refreshed with new data."
          });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to payment changes");
        }
      });

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Financial Data</AlertTitle>
        <AlertDescription>
          There was a problem loading the financial metrics. Please try again later or contact support if the problem persists.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = payments
    ?.filter(payment => payment.type === 'Income' && payment.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  const totalExpenses = payments
    ?.filter(payment => payment.type === 'Expense' && payment.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <FinancialMetricsCard
          title="Total Revenue"
          amount={totalRevenue}
          type="revenue"
        />
        <FinancialMetricsCard
          title="Total Expenses"
          amount={totalExpenses}
          type="expense"
        />
        <FinancialMetricsCard
          title="Net Income"
          amount={netIncome}
          type="net"
        />
      </div>

      <div className="bg-card rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
        <RevenueChart data={payments || []} />
      </div>
    </div>
  );
};