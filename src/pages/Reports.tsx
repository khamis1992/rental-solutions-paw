import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";
import { FleetAnalytics } from "@/components/reports/FleetAnalytics";
import { FinancialReports } from "@/components/reports/FinancialReports";

export default function Reports() {
  return (
    <div className="w-full bg-background">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">Reports & Analytics</h1>
          <p className="text-muted-foreground">View detailed reports and analytics</p>
        </div>
        
        <CustomerAnalytics />
        <FleetAnalytics />
        <FinancialReports />
      </div>
    </div>
  );
}