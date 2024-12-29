import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
          <p className="text-2xl font-bold tracking-tight">{paymentCount}</p>
        </div>
      </Card>
      <Card className="p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Unassigned Fines</p>
          <p className="text-2xl font-bold tracking-tight">{unassignedCount}</p>
        </div>
      </Card>
      <Card className="p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalAmount)}</p>
        </div>
      </Card>
      <Card className="p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Unassigned Amount</p>
          <p className="text-2xl font-bold tracking-tight">{formatCurrency(unassignedAmount)}</p>
        </div>
      </Card>
    </div>
  );
}