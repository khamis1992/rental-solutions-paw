import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueAnalysis } from "@/components/reports/RevenueAnalysis";
import { FleetStatus } from "@/components/reports/FleetStatus";
import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";
import { LeaseToOwn } from "@/components/reports/LeaseToOwn";
import { InstallmentAnalysis } from "@/components/reports/InstallmentAnalysis";
import { PerformanceInsights } from "@/components/performance/PerformanceInsights";
import { FileText, ChartBar, Users, FilePen, Calculator, Brain } from "lucide-react";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive insights into your fleet operations and business performance.
        </p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-lg flex flex-wrap gap-2">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            Revenue Analysis
          </TabsTrigger>
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Fleet Status
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Analytics
          </TabsTrigger>
          <TabsTrigger value="lease" className="flex items-center gap-2">
            <FilePen className="h-4 w-4" />
            Lease-to-Own
          </TabsTrigger>
          <TabsTrigger value="installment" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Installment Analysis
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Performance Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueAnalysis />
        </TabsContent>

        <TabsContent value="fleet">
          <FleetStatus />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerAnalytics />
        </TabsContent>

        <TabsContent value="lease">
          <LeaseToOwn />
        </TabsContent>

        <TabsContent value="installment">
          <InstallmentAnalysis />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceInsights />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;