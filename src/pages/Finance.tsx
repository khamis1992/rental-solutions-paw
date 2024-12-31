import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueDashboard } from "@/components/finance/dashboard/RevenueDashboard";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { TransactionList } from "@/components/finance/transactions/TransactionList";
import { TransactionImport } from "@/components/finance/transactions/TransactionImport";
import { TransactionCategorization } from "@/components/finance/transactions/TransactionCategorization";
import { performanceMetrics } from "@/services/performanceMonitoring";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Finance() {
  const handleTabChange = async (value: string) => {
    console.log(`Switched to ${value} tab`);
    try {
      await performanceMetrics.trackCPUUtilization(performance.now());
      
      // Track tab navigation for analytics
      toast.success(`Navigated to ${value} section`, {
        description: "Loading content...",
        duration: 2000
      });
    } catch (error) {
      console.error('Error tracking metrics:', error);
      toast.error("Error loading content", {
        description: "Please try again"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Financial Management</h1>
        
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="categorization">Categorization</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <RevenueDashboard />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionList />
          </TabsContent>

          <TabsContent value="import">
            <TransactionImport />
          </TabsContent>

          <TabsContent value="categorization">
            <TransactionCategorization />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}