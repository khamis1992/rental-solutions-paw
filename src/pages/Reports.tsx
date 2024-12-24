import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";
import { FinancialReports } from "@/components/reports/FinancialReports";
import { FleetAnalytics } from "@/components/reports/FleetAnalytics";
import { InstallmentAnalysis } from "@/components/reports/InstallmentAnalysis";
import { ProfitMarginAnalysis } from "@/components/reports/ProfitMarginAnalysis";
import { RevenueAnalysis } from "@/components/reports/RevenueAnalysis";
import { YearOverYearComparison } from "@/components/reports/YearOverYearComparison";

export default function Reports() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueAnalysis />
        <CustomerAnalytics />
        <FleetAnalytics />
        <FinancialReports />
        <InstallmentAnalysis />
        <ProfitMarginAnalysis />
        <YearOverYearComparison />
      </div>
    </div>
  );
}