import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface InstallmentSummaryProps {
  totalChecks: number;
  paidChecks: number;
  pendingChecks: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export const InstallmentSummary = ({
  totalChecks,
  paidChecks,
  pendingChecks,
  totalAmount,
  paidAmount,
  pendingAmount,
}: InstallmentSummaryProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Installment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Checks</p>
            <p className="text-2xl font-bold">{totalChecks}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Paid Checks</p>
            <p className="text-2xl font-bold text-green-600">{paidChecks}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pending Checks</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingChecks}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Paid Amount</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};