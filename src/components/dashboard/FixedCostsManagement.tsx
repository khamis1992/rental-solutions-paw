import { Card } from "@/components/ui/card";

export function FixedCostsManagement() {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Fixed Costs Management</p>
        <p className="text-muted-foreground text-sm">
          This feature has been temporarily removed during the finance module refactoring.
        </p>
      </div>
    </Card>
  );
}