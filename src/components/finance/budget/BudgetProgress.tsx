import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface BudgetProgressProps {
  budgetLimit: number;
  currentSpending: number;
  period: string | null;
}

export const BudgetProgress = ({ budgetLimit, currentSpending, period }: BudgetProgressProps) => {
  const percentage = (currentSpending / budgetLimit) * 100;
  const isOverBudget = currentSpending > budgetLimit;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          {formatCurrency(currentSpending)} / {formatCurrency(budgetLimit)}
          {period && <span className="text-muted-foreground ml-1">({period})</span>}
        </span>
        <span className="flex items-center gap-1">
          {isOverBudget ? (
            <>
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Over budget</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Within budget</span>
            </>
          )}
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className={isOverBudget ? "bg-red-100" : undefined}
      />
    </div>
  );
};