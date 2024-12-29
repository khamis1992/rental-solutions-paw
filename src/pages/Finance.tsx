import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RevenueDashboard } from "@/components/finance/dashboard/RevenueDashboard";
import { TransactionCategorization } from "@/components/finance/transactions/TransactionCategorization";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { TransactionImport } from "@/components/finance/transactions/TransactionImport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Finance = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Management</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
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

        <TabsContent value="import" className="space-y-6">
          <TransactionImport />
        </TabsContent>

        <TabsContent value="categorization">
          <TransactionCategorization />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;