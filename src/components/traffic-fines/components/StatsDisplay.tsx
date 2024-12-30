import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ManualTrafficFineDialog } from "../ManualTrafficFineDialog";
import { RefreshCw } from "lucide-react";

interface StatsDisplayProps {
  paymentCount: number;
  unassignedCount: number;
  totalAmount: number;
  unassignedAmount: number;
  onReconcile: () => void;
  isReconciling: boolean;
}

export function StatsDisplay({ 
  paymentCount, 
  unassignedCount, 
  totalAmount, 
  unassignedAmount,
  onReconcile,
  isReconciling
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
        <ManualTrafficFineDialog onFineAdded={() => {}} />
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
        <Button
          onClick={onReconcile}
          disabled={isReconciling || !unassignedCount}
          variant="default"
          size="sm"
          className="w-full text-sm font-medium"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
          Auto-Assign All
        </Button>
      </div>
    </div>
  );
}