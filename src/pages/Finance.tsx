import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TransactionList } from "@/components/finance/transactions/TransactionList";

const Finance = () => {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <TransactionList />
      </div>
    </DashboardLayout>
  );
};

export default Finance;