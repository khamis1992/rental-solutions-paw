import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessIntelligenceSection } from "@/components/reports/sections/BusinessIntelligenceSection";
import { FinancialAnalyticsSection } from "@/components/reports/sections/FinancialAnalyticsSection";
import { CustomerReportSection } from "@/components/reports/sections/CustomerReportSection";
import { FleetReportSection } from "@/components/reports/sections/FleetReportSection";
import { OperationalReportSection } from "@/components/reports/sections/OperationalReportSection";

const Reports = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      
      <Tabs defaultValue="business" className="space-y-6">
        <TabsList>
          <TabsTrigger value="business">Business Intelligence</TabsTrigger>
          <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
          <TabsTrigger value="customer">Customer Reports</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Reports</TabsTrigger>
          <TabsTrigger value="operational">Operational Reports</TabsTrigger>
        </TabsList>

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

        <TabsContent value="operational">
          <OperationalReportSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;