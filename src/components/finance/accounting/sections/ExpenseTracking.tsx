import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export const ExpenseTracking = () => {
  const { data: expenses } = useQuery({
    queryKey: ["expense-tracking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .eq("type", "expense")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses?.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(expense.transaction_date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(expense.amount)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};