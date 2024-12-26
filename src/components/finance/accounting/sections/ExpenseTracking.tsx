import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionForm } from "../TransactionForm";
import { TransactionList } from "../TransactionList";
import { Transaction } from "@/types/finance.types";

export const ExpenseTracking = () => {
  const { data: transactions } = useQuery({
    queryKey: ["expense-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          *,
          accounting_categories (
            name,
            type
          )
        `)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure transactions match our Transaction type
      return (data as Transaction[]).map(transaction => ({
        ...transaction,
        type: transaction.type as 'income' | 'expense'
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income & Expenses</h2>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">New Transaction</TabsTrigger>
          <TabsTrigger value="list">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Add New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};