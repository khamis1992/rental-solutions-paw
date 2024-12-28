import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { IncomeList } from "./IncomeList";
import { ExpenseList } from "./ExpenseList";
import { TransactionSummary } from "./TransactionSummary";

export const IncomeExpenseTracking = () => {
  const [activeTab, setActiveTab] = useState("income");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const incomeTransactions = transactions?.filter(t => t.type === 'INCOME') || [];
  const expenseTransactions = transactions?.filter(t => t.type === 'EXPENSE') || [];

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-6">
      <TransactionSummary
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netIncome={totalIncome - totalExpenses}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <IncomeList transactions={incomeTransactions} />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseList transactions={expenseTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};