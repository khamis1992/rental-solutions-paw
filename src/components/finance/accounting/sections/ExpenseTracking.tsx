import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Plus, Receipt, Upload } from "lucide-react";
import { ExpenseForm } from "../forms/ExpenseForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export const ExpenseTracking = () => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          *,
          category:accounting_categories(name)
        `)
        .eq("type", "expense")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ExpenseForm onSuccess={() => setShowExpenseForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {expenses?.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="flex justify-between items-center p-6">
              <div className="space-y-1">
                <p className="font-medium">{expense.category.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(expense.transaction_date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="font-medium text-red-500">
                  {formatCurrency(expense.amount)}
                </p>
                {expense.receipt_url && (
                  <Button variant="outline" size="sm">
                    <Receipt className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};