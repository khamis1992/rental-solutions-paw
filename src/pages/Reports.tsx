import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerReportSection } from "@/components/reports/sections/CustomerReportSection";
import { FleetReportSection } from "@/components/reports/sections/FleetReportSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string>("");

  const generateReport = async () => {
    // Report generation logic
    console.log("Generating report:", selectedReport);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        
        <Tabs defaultValue="customer" className="w-full">
          <TabsList>
            <TabsTrigger value="customer">Customer Reports</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="customer">
            <CustomerReportSection 
              selectedReport={selectedReport}
              setSelectedReport={setSelectedReport}
              generateReport={generateReport}
            />
          </TabsContent>

          <TabsContent value="fleet">
            <FleetReportSection 
              selectedReport={selectedReport}
              setSelectedReport={setSelectedReport}
              generateReport={generateReport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;