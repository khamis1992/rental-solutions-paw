import { CashFlowProjections } from "../FinancialAnalytics/CashFlowProjections";
import { ProfitMarginByVehicle } from "../FinancialAnalytics/ProfitMarginByVehicle";
import { CostCenterAnalysis } from "../FinancialAnalytics/CostCenterAnalysis";
import { MaintenanceROI } from "../FinancialAnalytics/MaintenanceROI";
import { DynamicPricing } from "../FinancialAnalytics/DynamicPricing";

export const FinancialAnalyticsSection = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <CashFlowProjections />
        <ProfitMarginByVehicle />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CostCenterAnalysis />
        <MaintenanceROI />
        <DynamicPricing />
      </div>
    </div>
  );
};