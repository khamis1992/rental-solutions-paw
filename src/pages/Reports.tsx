import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FleetAnalytics } from "@/components/reports/FleetAnalytics";
import { FinancialReports } from "@/components/reports/FinancialReports";
import { CustomerInsights } from "@/components/reports/CustomerInsights";

const Reports = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive insights into fleet performance, financials, and customer behavior
              </p>
            </div>

            <Tabs defaultValue="fleet" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="fleet">Fleet Analytics</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
              </TabsList>

              <TabsContent value="fleet" className="space-y-6">
                <FleetAnalytics />
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                <FinancialReports />
              </TabsContent>

              <TabsContent value="customer" className="space-y-6">
                <CustomerInsights />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;