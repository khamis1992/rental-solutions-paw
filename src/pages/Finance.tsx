import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RevenueDashboard } from "@/components/finance/dashboard/RevenueDashboard";
import { TransactionCategorization } from "@/components/finance/transactions/TransactionCategorization";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { TransactionImportDialog } from "@/components/finance/transactions/TransactionImportDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

const Finance = () => {
  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <Button
          onClick={() => setShowImportDialog(true)}
          className="flex items-center gap-2"
        >
          <FileUp className="h-4 w-4" />
          Import Transactions
        </Button>
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
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

        <TabsContent value="categorization">
          <TransactionCategorization />
        </TabsContent>
      </Tabs>

      <TransactionImportDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
      />
    </div>
  );
};

export default Finance;