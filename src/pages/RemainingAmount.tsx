import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RemainingAmountImport } from "@/components/remaining-amount/RemainingAmountImport";
import { RemainingAmountList } from "@/components/remaining-amount/RemainingAmountList";
import { RemainingAmountStats } from "@/components/remaining-amount/RemainingAmountStats";

export default function RemainingAmount() {
  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Remaining Amounts</h1>
          <RemainingAmountImport />
        </div>

        <div className="grid gap-6">
          <RemainingAmountStats />
          <RemainingAmountList />
        </div>
      </div>
    </DashboardLayout>
  );
}