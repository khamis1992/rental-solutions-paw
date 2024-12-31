import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RevenueDashboard } from "@/components/finance/dashboard/RevenueDashboard";
import { TransactionCategorization } from "@/components/finance/transactions/TransactionCategorization";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { TransactionImportTool } from "@/components/finance/transactions/TransactionImportTool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Finance = () => {
  useEffect(() => {
    console.log("Finance page mounted");
    // Log performance metrics
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`Finance page unmounted after ${endTime - startTime}ms`);
    };
  }, []);

  const handleTabChange = (value: string) => {
    console.log(`Switched to ${value} tab`);
  };

  return (
    <RouteWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Financial Management</h1>
        
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="import">Import Transactions</TabsTrigger>
            <TabsTrigger value="categorization">Categorization</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RevenueDashboard />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="transactions">
            {/* Transaction management components will go here */}
          </TabsContent>

          <TabsContent value="import">
            <TransactionImportTool />
          </TabsContent>

          <TabsContent value="categorization">
            <TransactionCategorization />
          </TabsContent>
        </Tabs>
      </div>
    </RouteWrapper>
  );
};

export default Finance;