import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueAnalysis } from "@/components/reports/RevenueAnalysis";
import { FleetStatus } from "@/components/reports/FleetStatus";
import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";
import { LeaseToOwn } from "@/components/reports/LeaseToOwn";

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
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Status</TabsTrigger>
          <TabsTrigger value="customer">Customer Analytics</TabsTrigger>
          <TabsTrigger value="lease">Lease-to-Own</TabsTrigger>
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
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;