import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
      <div className="space-y-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Fines</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">
              QAR {formatCurrency(totalAmount).replace('$', '')}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Count</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{paymentCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned Fines</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">
              QAR {formatCurrency(unassignedAmount).replace('$', '')}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned Count</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{unassignedCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}