import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FinancialReports } from "@/components/reports/FinancialReports";
import { PaymentImport } from "@/components/payments/PaymentImport";
import { PaymentReconciliation } from "@/components/payments/PaymentReconciliation";
import { RevenueAnalysis } from "@/components/reports/RevenueAnalysis";
import { InstallmentAnalysis } from "@/components/reports/InstallmentAnalysis";
import { PaymentHistoryContent } from "@/components/agreements/payments/PaymentHistoryContent";
import { CompanyExpenses } from "@/components/dashboard/CompanyExpenses";
import { AiAccountantDashboard } from "@/components/finance/ai-accountant/AiAccountantDashboard";
import { RentManagementSection } from "@/components/finance/rent/RentManagementSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChartBar, Calculator, Brain, CreditCard, History, DollarSign, Bot, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Finance = () => {
  const { data: paymentHistory, isLoading } = useQuery({
    queryKey: ["payment-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          security_deposits (
            amount,
            status
          ),
          leases (
            agreement_number,
            customer_id,
            profiles:customer_id (
              full_name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }

      return data;
    },
  });

  const totalPaid = paymentHistory?.reduce((sum, payment) => {
    if (payment.status === "completed") {
      return sum + payment.amount;
    }
    return sum;
  }, 0) || 0;

  const totalRefunded = paymentHistory?.reduce((sum, payment) => {
    if (payment.status === "refunded") {
      return sum + payment.amount;
    }
    return sum;
  }, 0) || 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 p-6">
        <h1 className="text-4xl font-bold tracking-tight">Financial Management</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-lg flex flex-wrap gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="company-expenses" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Company Expenses
            </TabsTrigger>
            <TabsTrigger value="rent" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Rent Management
            </TabsTrigger>
            <TabsTrigger value="ai-accountant" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Accountant
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="installments" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Installments
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Payment History
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <RevenueAnalysis />
          </TabsContent>

          <TabsContent value="company-expenses" className="space-y-6">
            <CompanyExpenses />
          </TabsContent>

          <TabsContent value="rent" className="space-y-6">
            <RentManagementSection />
          </TabsContent>

          <TabsContent value="ai-accountant" className="space-y-6">
            <AiAccountantDashboard />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Import</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentImport />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Reconciliation</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentReconciliation />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="installments" className="space-y-6">
            <InstallmentAnalysis />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <PaymentHistoryContent
              paymentHistory={paymentHistory || []}
              isLoading={isLoading}
              totalPaid={totalPaid}
              totalRefunded={totalRefunded}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finance;