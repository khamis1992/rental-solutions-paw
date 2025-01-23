import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  FileSpreadsheet, 
  Car,
  FileText,
  Filter,
  Download
} from "lucide-react";
import { CustomerReportSection } from "@/components/reports/sections/CustomerReportSection";
import { OperationalReportSection } from "@/components/reports/sections/OperationalReportSection";
import { FinancialReportSection } from "@/components/reports/sections/FinancialReportSection";
import { FleetAnalyticsDashboard } from "@/components/reports/FleetAnalytics/FleetAnalyticsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Comprehensive insights into your fleet operations and business performance
          </p>
        </div>

        <Tabs defaultValue="fleet" className="space-y-8">
          <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="p-6">
              <TabsList className="inline-flex h-12 items-center justify-start space-x-4 rounded-lg bg-muted/50 p-1">
                <TabsTrigger 
                  value="fleet" 
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Car className="h-5 w-5" />
                  Fleet Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="customer" 
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Users className="h-5 w-5" />
                  Customer Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="operational" 
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="h-5 w-5" />
                  Operational Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  Financial Reports
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter
                </Button>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export
                </Button>
                <Button variant="default" size="lg" className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                  <FileText className="h-5 w-5" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-6">
            <TabsContent value="fleet" className="space-y-6">
              <FleetAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="customer">
              <CustomerReportSection />
            </TabsContent>

            <TabsContent value="operational">
              <OperationalReportSection />
            </TabsContent>

            <TabsContent value="financial">
              <FinancialReportSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;