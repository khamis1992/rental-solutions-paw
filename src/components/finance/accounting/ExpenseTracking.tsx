import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";

export const ExpenseTracking = () => {
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
              <TransactionList transactions={[]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};