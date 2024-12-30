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
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4 flex-1">
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
          <p className="text-2xl font-bold">{paymentCount}</p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Unassigned Fines</p>
          <p className="text-2xl font-bold">{unassignedCount}</p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Unassigned Amount</p>
          <p className="text-2xl font-bold">{formatCurrency(unassignedAmount)}</p>
        </div>
      </Card>
    </div>
  );
}