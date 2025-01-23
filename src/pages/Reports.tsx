import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessIntelligenceSection } from "@/components/reports/sections/BusinessIntelligenceSection";
import { FinancialAnalyticsSection } from "@/components/reports/sections/FinancialAnalyticsSection";
import { CustomerReportSection } from "@/components/reports/sections/CustomerReportSection";
import { FleetReportSection } from "@/components/reports/sections/FleetReportSection";
import { OperationalReportSection } from "@/components/reports/sections/OperationalReportSection";
import { OperationalEfficiencySection } from "@/components/reports/sections/OperationalEfficiencySection";

const Reports = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      
      <Tabs defaultValue="operational" className="space-y-6">
        <TabsList>
          <TabsTrigger value="operational">Operational Efficiency</TabsTrigger>
          <TabsTrigger value="business">Business Intelligence</TabsTrigger>
          <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
          <TabsTrigger value="customer">Customer Reports</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="operational">
          <OperationalEfficiencySection />
        </TabsContent>

        <TabsContent value="business">
          <BusinessIntelligenceSection />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialAnalyticsSection />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerReportSection />
        </TabsContent>

        <TabsContent value="fleet">
          <FleetReportSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;