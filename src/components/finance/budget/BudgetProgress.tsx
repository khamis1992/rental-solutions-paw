import { Progress } from "@/components/ui/progress";

interface BudgetProgressProps {
  current: number;
  limit: number;
  label: string;
}

export const BudgetProgress = ({ current, limit, label }: BudgetProgressProps) => {
  const percentage = Math.min((current / limit) * 100, 100);
  const isOverBudget = current > limit;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={isOverBudget ? "text-red-500" : "text-muted-foreground"}>
          ${current.toFixed(2)} / ${limit.toFixed(2)}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={isOverBudget ? "bg-red-100" : undefined}
        indicatorClassName={isOverBudget ? "bg-red-500" : undefined}
      />
    </div>
  );
};