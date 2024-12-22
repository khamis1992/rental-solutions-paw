import { AccountingOverview } from "@/components/finance/accounting/AccountingOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentTransactions } from "@/components/finance/RecentTransactions";
import { TransactionForm } from "@/components/finance/accounting/TransactionForm";

export default function Finance() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">
          Manage your financial transactions and view reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounting Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountingOverview />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}