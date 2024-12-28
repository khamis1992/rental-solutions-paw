import { Card } from "@/components/ui/card";

export function CompanyExpenses() {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Company Expenses</p>
        <p className="text-muted-foreground text-sm">
          This feature has been temporarily removed during the finance module refactoring.
        </p>
      </div>
    </Card>
  );
}