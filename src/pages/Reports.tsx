import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FleetStatus } from "@/components/reports/FleetStatus";
import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";
import { PerformanceInsights } from "@/components/performance/PerformanceInsights";
import { FileText, Users, Brain } from "lucide-react";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive insights into your fleet operations and business performance.
        </p>
      </div>

      <Tabs defaultValue="fleet" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-lg flex flex-wrap gap-2">
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Fleet Status
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Performance Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet">
          <FleetStatus />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerAnalytics />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceInsights />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;