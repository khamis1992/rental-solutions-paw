import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { RecurringPayments } from "@/components/payments/RecurringPayments";
import { PaymentReconciliation } from "@/components/payments/PaymentReconciliation";

export const PaymentManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new-payment" className="space-y-4">
            <TabsList>
              <TabsTrigger value="new-payment">New Payment</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Payments</TabsTrigger>
              <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            </TabsList>

            <TabsContent value="new-payment">
              <PaymentForm />
            </TabsContent>

            <TabsContent value="recurring">
              <RecurringPayments />
            </TabsContent>

            <TabsContent value="reconciliation">
              <PaymentReconciliation />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};