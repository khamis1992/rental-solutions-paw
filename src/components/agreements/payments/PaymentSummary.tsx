import { formatCurrency } from "@/lib/utils";

interface PaymentSummaryProps {
  totalPaid: number;
  totalRefunded: number;
}

export function PaymentSummary({ totalPaid, totalRefunded }: PaymentSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-lg border bg-card">
        <div className="text-sm text-muted-foreground">Total Paid</div>
        <div className="text-2xl font-semibold">{formatCurrency(totalPaid)}</div>
      </div>
      <div className="p-4 rounded-lg border bg-card">
        <div className="text-sm text-muted-foreground">Total Refunded</div>
        <div className="text-2xl font-semibold">{formatCurrency(totalRefunded)}</div>
      </div>
    </div>
  );
}