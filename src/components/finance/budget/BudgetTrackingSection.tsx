import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetProgress } from "./BudgetProgress";
import { Category, Transaction } from "../types/transaction.types";

interface BudgetTrackingSectionProps {
  transactions: Transaction[];
  categories: Category[];
}

export const BudgetTrackingSection = ({ transactions, categories }: BudgetTrackingSectionProps) => {
  const calculateCategorySpending = (categoryId: string): number => {
    return transactions
      .filter(t => t.category_id === categoryId && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const categoriesWithBudgets = categories.filter(c => c.budget_limit > 0);

  if (categoriesWithBudgets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoriesWithBudgets.map(category => (
          <BudgetProgress
            key={category.id}
            label={category.name}
            current={calculateCategorySpending(category.id)}
            limit={category.budget_limit}
          />
        ))}
      </CardContent>
    </Card>
  );
};