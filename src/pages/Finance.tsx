import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RevenueDashboard } from "@/components/finance/dashboard/RevenueDashboard";
import { TransactionCategorization } from "@/components/finance/transactions/TransactionCategorization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Finance = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4">
            <RevenueDashboard />
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <TransactionCategorization />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finance;