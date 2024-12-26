import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionImport } from "@/components/finance/transaction-import/TransactionImport";
import { AccountingDashboard } from "@/components/finance/accounting/AccountingDashboard";

const Finance = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold" tabIndex={0}>Finance</h1>

        <Tabs defaultValue="accounting" className="space-y-6">
          <TabsList aria-label="Finance sections">
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="import">Import Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="accounting" role="tabpanel">
            <AccountingDashboard />
          </TabsContent>

          <TabsContent value="import" role="tabpanel">
            <TransactionImport />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finance;