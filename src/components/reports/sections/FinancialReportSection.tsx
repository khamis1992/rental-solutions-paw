import { YearOverYearComparison } from "../YearOverYearComparison";
import { RevenueChart } from "../charts/RevenueChart";
import { ExpenseChart } from "../charts/ExpenseChart";

export const FinancialReportSection = () => {
  return (
    <div className="space-y-6">
      <YearOverYearComparison />
      <RevenueChart data={[]} onExport={() => {}} />
      <ExpenseChart data={[]} onExport={() => {}} />
    </div>
  );
};