import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FinancialReports } from "@/components/reports/FinancialReports";
import { PaymentImport } from "@/components/payments/PaymentImport";
import { PaymentReconciliation } from "@/components/payments/PaymentReconciliation";
import { RevenueAnalysis } from "@/components/reports/RevenueAnalysis";
import { InstallmentAnalysis } from "@/components/reports/InstallmentAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiAnalyticsInsights } from "@/components/analytics/AiAnalyticsInsights";
import { FileText, ChartBar, Calculator, Brain, CreditCard } from "lucide-react";

const Finance = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Financial Management</h1>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-lg flex flex-wrap gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="installments" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Installments
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <RevenueAnalysis />
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

          <TabsContent value="reports" className="space-y-6">
            <FinancialReports />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AiAnalyticsInsights />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finance;