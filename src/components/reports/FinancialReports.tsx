import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { RevenueChart } from "./charts/RevenueChart";
import { ExpenseChart } from "./charts/ExpenseChart";
import { PayrollManagement } from "./PayrollManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { TransactionType } from "@/components/finance/accounting/types/transaction.types";

export const FinancialReports = () => {
  const { toast } = useToast();

  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["financial-reports"],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("unified_payments")  // Updated from 'payments' to 'unified_payments'
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
      return payments;
    },
  });

  const { data: maintenanceData, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ["maintenance-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .order('created_at');

      if (error) throw error;
      return data;
    },
  });

  // Update the query to use the correct enum value
  const { data: transactionData } = useQuery({
    queryKey: ["transaction-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("amount")
        .eq("type", TransactionType.INCOME)  // Use the enum value instead of string
        .gte("transaction_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte("transaction_date", new Date().toISOString());

      if (error) throw error;
      return data;
    },
  });

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

    const amount = payment.amount || 0;
    acc[monthYear].total += amount;

    if (payment.lease?.agreement_type === 'short_term') {
      acc[monthYear].shortTerm += amount;
    } else {
      acc[monthYear].leaseToOwn += amount;
    }

    return acc;
  }, {});

  const monthlyExpenses = maintenanceData?.reduce((acc: any, record) => {
    const date = new Date(record.created_at);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        maintenance: 0,
      };
    }

    acc[monthYear].maintenance += record.cost || 0;
    return acc;
  }, {});

  const revenueData = Object.values(monthlyRevenue || {});
  const expenseData = Object.values(monthlyExpenses || {});

  const exportData = (data: any, filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\n" +
      data.map((row: any) => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded`,
    });
  };

  if (isLoadingFinancial || isLoadingMaintenance) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="payroll">Payroll</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-6">
          <RevenueChart 
            data={revenueData} 
            onExport={() => exportData(revenueData, "revenue-by-type")} 
          />
          <ExpenseChart 
            data={expenseData} 
            onExport={() => exportData(expenseData, "monthly-expenses")} 
          />
        </div>
      </TabsContent>

      <TabsContent value="payroll">
        <PayrollManagement />
      </TabsContent>
    </Tabs>
  );
};