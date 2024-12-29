import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceInsights } from "@/components/performance/PerformanceInsights";
import { Car, Users, Brain, FileSpreadsheet, Code } from "lucide-react";
import { useState } from "react";
import { FleetReportSection } from "@/components/reports/sections/FleetReportSection";
import { CustomerReportSection } from "@/components/reports/sections/CustomerReportSection";
import { OperationalReportSection } from "@/components/reports/sections/OperationalReportSection";
import { FinancialReportSection } from "@/components/reports/sections/FinancialReportSection";
import { CodeAnalysisDashboard } from "@/components/codeanalysis/CodeAnalysisDashboard";
import { toast } from "sonner";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("");

  const generateReport = () => {
    if (!selectedReport) {
      toast.error("Please select a report type first");
      return;
    }
    
    toast.success(`Generating ${selectedReport} report...`);
    console.log("Generating report:", selectedReport);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your fleet operations and business performance.
          </p>
        </div>

        <Tabs defaultValue="fleet" className="space-y-6">
          <TabsList className="bg-white border rounded-lg p-1 flex flex-wrap gap-2">
            <TabsTrigger value="fleet" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-bold">
              <Car className="h-4 w-4 mr-2" />
              Fleet Reports
            </TabsTrigger>
            <TabsTrigger value="customer" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-bold">
              <Users className="h-4 w-4 mr-2" />
              Customer Reports
            </TabsTrigger>
            <TabsTrigger value="operational" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-bold">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Operational Reports
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-bold">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Financial Reports
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-bold">
              <Brain className="h-4 w-4 mr-2" />
              Performance Insights
            </TabsTrigger>
            <TabsTrigger value="code-analysis" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-bold">
              <Code className="h-4 w-4 mr-2" />
              Code Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fleet" className="space-y-6">
            <FleetReportSection
              selectedReport={selectedReport}
              setSelectedReport={setSelectedReport}
              generateReport={generateReport}
            />
          </TabsContent>

          <TabsContent value="customer" className="space-y-6">
            <CustomerReportSection
              selectedReport={selectedReport}
              setSelectedReport={setSelectedReport}
              generateReport={generateReport}
            />
          </TabsContent>

          <TabsContent value="operational" className="space-y-6">
            <OperationalReportSection
              selectedReport={selectedReport}
              setSelectedReport={setSelectedReport}
              generateReport={generateReport}
            />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialReportSection />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceInsights />
          </TabsContent>

          <TabsContent value="code-analysis" className="space-y-6">
            <CodeAnalysisDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;