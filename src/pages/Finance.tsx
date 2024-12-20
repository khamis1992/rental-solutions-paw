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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChartBar, Calculator, CreditCard, History, DollarSign, Bot, Home } from "lucide-react";
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Financial Dashboard</h1>
        </div>

        {/* Overview Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRefunded.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">-4% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentHistory?.length || 0}</div>
              <p className="text-xs text-muted-foreground">+12 since last hour</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Analysis */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueAnalysis />
            </CardContent>
          </Card>

          {/* Company Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Company Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyExpenses />
            </CardContent>
          </Card>

          {/* AI Accountant */}
          <Card>
            <CardHeader>
              <CardTitle>AI Accountant</CardTitle>
            </CardHeader>
            <CardContent>
              <AiAccountantDashboard />
            </CardContent>
          </Card>

          {/* Rent Management */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Rent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <RentManagementSection />
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentHistoryContent
                paymentHistory={paymentHistory || []}
                isLoading={isLoading}
                totalPaid={totalPaid}
                totalRefunded={totalRefunded}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Finance;