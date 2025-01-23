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
import { useState } from "react";
import { FleetReportSection } from "@/components/reports/sections/FleetReportSection";
import { CustomerReportSection } from "@/components/reports/sections/CustomerReportSection";
import { OperationalReportSection } from "@/components/reports/sections/OperationalReportSection";
import { FinancialReportSection } from "@/components/reports/sections/FinancialReportSection";
import { FleetAnalyticsDashboard } from "@/components/reports/FleetAnalytics/FleetAnalyticsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("");

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
          <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <CardContent className="py-3">
              <TabsList className="bg-muted/50 p-1 rounded-lg flex flex-wrap gap-2">
                <TabsTrigger value="fleet" className="flex items-center gap-2 text-base font-medium">
                  <Car className="h-4 w-4" />
                  Fleet Analytics
                </TabsTrigger>
                <TabsTrigger value="customer" className="flex items-center gap-2 text-base font-medium">
                  <Users className="h-4 w-4" />
                  Customer Reports
                </TabsTrigger>
                <TabsTrigger value="operational" className="flex items-center gap-2 text-base font-medium">
                  <BarChart3 className="h-4 w-4" />
                  Operational Reports
                </TabsTrigger>
                <TabsTrigger value="financial" className="flex items-center gap-2 text-base font-medium">
                  <FileSpreadsheet className="h-4 w-4" />
                  Financial Reports
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
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
              <CustomerReportSection
                selectedReport={selectedReport}
                setSelectedReport={setSelectedReport}
                generateReport={() => {}}
              />
            </TabsContent>

            <TabsContent value="operational">
              <OperationalReportSection
                selectedReport={selectedReport}
                setSelectedReport={setSelectedReport}
                generateReport={() => {}}
              />
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