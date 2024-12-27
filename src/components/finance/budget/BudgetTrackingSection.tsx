import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetProgress } from "./BudgetProgress";

interface Category {
  id: string;
  name: string;
  type: string;
  budget_limit: number | null;
  budget_period: string | null;
}

interface Transaction {
  amount: number;
  category: Category;
  type: 'INCOME' | 'EXPENSE';
}

interface BudgetTrackingSectionProps {
  transactions: Transaction[];
  categories: Category[];
}

export const BudgetTrackingSection = ({ transactions, categories }: BudgetTrackingSectionProps) => {
  const categoriesWithSpending = categories.map(category => {
    const categoryTransactions = transactions.filter(
      t => t.category?.id === category.id && t.type === 'EXPENSE'
    );
    
    const currentSpending = categoryTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

    return {
      ...category,
      currentSpending
    };
  });

  const categoriesWithBudgets = categoriesWithSpending.filter(
    c => c.budget_limit !== null && c.type === 'EXPENSE'
  );

  if (categoriesWithBudgets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Tracking</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {categoriesWithBudgets.map(category => (
          <div key={category.id} className="space-y-2">
            <div className="font-medium">{category.name}</div>
            <BudgetProgress
              budgetLimit={category.budget_limit || 0}
              currentSpending={category.currentSpending}
              period={category.budget_period}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};