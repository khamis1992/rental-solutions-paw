import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ManualTrafficFineDialog } from "../ManualTrafficFineDialog";
import { RefreshCw, DollarSign, FileText, AlertTriangle } from "lucide-react";

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
        <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(totalAmount)}
                </h3>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Count</p>
                <h3 className="text-2xl font-bold mt-1">{paymentCount}</h3>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <ManualTrafficFineDialog onFineAdded={() => {}} />
      </div>

      <div className="space-y-6">
        <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unassigned Fines</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(unassignedAmount)}
                </h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unassigned Count</p>
                <h3 className="text-2xl font-bold mt-1">{unassignedCount}</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Button
          onClick={onReconcile}
          disabled={isReconciling || !unassignedCount}
          variant="default"
          size="sm"
          className="w-full text-sm font-medium bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
          Auto-Assign All
        </Button>
      </div>
    </div>
  );
}