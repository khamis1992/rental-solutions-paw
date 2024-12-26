import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RemainingAmountImport } from "@/components/remaining-amount/RemainingAmountImport";
import { RemainingAmountList } from "@/components/remaining-amount/RemainingAmountList";
import { RemainingAmountStats } from "@/components/remaining-amount/RemainingAmountStats";

export default function RemainingAmount() {
  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Remaining Amounts</h1>
        </div>

        <RemainingAmountStats />
        <RemainingAmountImport />
        <RemainingAmountList />
      </div>
    </DashboardLayout>
  );
}