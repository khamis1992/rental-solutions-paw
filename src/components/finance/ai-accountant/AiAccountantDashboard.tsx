import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseManagement } from "./ExpenseManagement";
import { FinancialForecasting } from "./FinancialForecasting";
import { FinancialInsights } from "./FinancialInsights";

export const AiAccountantDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseManagement />
        <FinancialForecasting />
      </div>
      <FinancialInsights />
    </div>
  );
};