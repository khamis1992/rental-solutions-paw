import { AccountingOverview } from "@/components/finance/accounting/AccountingOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    </div>
  );
}