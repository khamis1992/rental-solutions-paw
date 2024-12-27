import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TransactionImport } from "@/components/finance/transaction-import/TransactionImport";

const Finance = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold" tabIndex={0}>Import Transactions</h1>
        <TransactionImport />
      </div>
    </DashboardLayout>
  );
};

export default Finance;