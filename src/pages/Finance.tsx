import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AccountingDashboard } from "@/components/finance/accounting/AccountingDashboard";

const Finance = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Finance</h1>
        <AccountingDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Finance;