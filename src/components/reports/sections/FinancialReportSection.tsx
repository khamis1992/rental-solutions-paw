import { YearOverYearComparison } from "../YearOverYearComparison";
import { RevenueChart } from "../charts/RevenueChart";
import { ExpenseChart } from "../charts/ExpenseChart";
import { ProfitMarginAnalysis } from "../ProfitMarginAnalysis";

export const FinancialReportSection = () => {
  return (
    <div className="grid gap-6 grid-cols-1">
      <YearOverYearComparison />
      <ProfitMarginAnalysis />
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <RevenueChart data={[]} onExport={() => {}} />
        <ExpenseChart data={[]} onExport={() => {}} />
      </div>
    </div>
  );
};