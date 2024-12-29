import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Coins, FileWarning, AlertCircle, DollarSign } from "lucide-react";

interface StatsDisplayProps {
  paymentCount: number;
  unassignedCount: number;
  totalAmount: number;
  unassignedAmount: number;
}

export function StatsDisplay({ 
  paymentCount, 
  unassignedCount, 
  totalAmount, 
  unassignedAmount 
}: StatsDisplayProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Fines"
        value={paymentCount.toString()}
        icon={FileWarning}
      />
      <StatsCard
        title="Unassigned Fines"
        value={unassignedCount.toString()}
        icon={AlertCircle}
      />
      <StatsCard
        title="Total Amount"
        value={formatCurrency(totalAmount)}
        icon={Coins}
      />
      <StatsCard
        title="Unassigned Amount"
        value={formatCurrency(unassignedAmount)}
        icon={DollarSign}
      />
    </div>
  );
}