import { DashboardGuide } from "./features/DashboardGuide";
import { FinanceGuide } from "./features/FinanceGuide";
import { ReportsGuide } from "./features/ReportsGuide";
import { CustomerGuide } from "./features/CustomerGuide";
import { AgreementsGuide } from "./features/AgreementsGuide";
import { VehiclesGuide } from "./features/VehiclesGuide";
import { LegalGuide } from "./features/LegalGuide";
import { HelpGuide } from "./features/HelpGuide";

export const FeatureGuides = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Feature Documentation</h2>
      <div className="grid gap-6">
        <DashboardGuide />
        <FinanceGuide />
        <ReportsGuide />
        <CustomerGuide />
        <AgreementsGuide />
        <VehiclesGuide />
        <LegalGuide />
        <HelpGuide />
      </div>
    </div>
  );
};