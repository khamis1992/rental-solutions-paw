import { YearOverYearComparison } from "../YearOverYearComparison";
import { RevenueChart } from "../charts/RevenueChart";
import { ExpenseChart } from "../charts/ExpenseChart";
import { ProfitMarginAnalysis } from "../ProfitMarginAnalysis";

export const FinancialReportSection = () => {
  return (
    <div className="space-y-6">
      <YearOverYearComparison />
      <ProfitMarginAnalysis />
      <RevenueChart data={[]} onExport={() => {}} />
      <ExpenseChart data={[]} onExport={() => {}} />
    </div>
  );
};