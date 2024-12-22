import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceInsights } from "@/components/performance/PerformanceInsights";
import { Car, Users, Brain, FileSpreadsheet, Code } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FleetReportSection } from "@/components/reports/sections/FleetReportSection";
import { CustomerReportSection } from "@/components/reports/sections/CustomerReportSection";
import { OperationalReportSection } from "@/components/reports/sections/OperationalReportSection";
import { CodeAnalysisDashboard } from "@/components/codeanalysis/CodeAnalysisDashboard";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const { toast } = useToast();

  // Query for vehicle reports
  const { data: vehicleData } = useQuery({
    queryKey: ["vehicles-report", selectedReport],
    queryFn: async () => {
      if (!selectedReport.startsWith("vehicle")) return null;
      
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          maintenance (*)
        `);
      
      if (error) throw error;
      return data;
    },
    enabled: selectedReport.startsWith("vehicle"),
  });

  // Query for customer reports
  const { data: customerData } = useQuery({
    queryKey: ["customers-report", selectedReport],
    queryFn: async () => {
      if (!selectedReport.startsWith("customer")) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          leases (*)
        `);
      
      if (error) throw error;
      return data;
    },
    enabled: selectedReport.startsWith("customer"),
  });

  // Query for operational reports
  const { data: operationalData } = useQuery({
    queryKey: ["operational-report", selectedReport],
    queryFn: async () => {
      if (!selectedReport.startsWith("operational")) return null;
      
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          vehicle:vehicles (*),
          customer:profiles (*)
        `);
      
      if (error) throw error;
      return data;
    },
    enabled: selectedReport.startsWith("operational"),
  });

  const generateReport = () => {
    if (!selectedReport) {
      toast({
        title: "Select Report Type",
        description: "Please select a report type before generating",
        variant: "destructive",
      });
      return;
    }

    let reportData;
    switch (selectedReport) {
      case "vehicle-summary":
        reportData = vehicleData?.map(v => ({
          "Vehicle": `${v.make} ${v.model}`,
          "Status": v.status,
          "Mileage": v.mileage,
          "Maintenance Count": v.maintenance?.length || 0
        }));
        break;
      case "customer-rental":
        reportData = customerData?.map(c => ({
          "Customer": c.full_name,
          "Total Rentals": c.leases?.length || 0,
          "Phone": c.phone_number,
          "Address": c.address
        }));
        break;
      case "operational-active":
        reportData = operationalData?.filter(l => l.status === 'active').map(l => ({
          "Agreement #": l.agreement_number,
          "Customer": l.customer?.full_name,
          "Vehicle": `${l.vehicle?.make} ${l.vehicle?.model}`,
          "Start Date": new Date(l.start_date).toLocaleDateString()
        }));
        break;
    }

    if (reportData && reportData.length > 0) {
      // Convert to CSV
      const headers = Object.keys(reportData[0]);
      const csv = [
        headers.join(','),
        ...reportData.map(row => headers.map(header => row[header]).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Your report has been downloaded successfully",
      });
    } else {
      toast({
        title: "No Data",
        description: "No data available for the selected report type",
        variant: "destructive",
      });
    }
  };

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
            <Car className="h-4 w-4" />
            Fleet Reports
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Reports
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Operational Reports
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Performance Insights
          </TabsTrigger>
          <TabsTrigger value="code-analysis" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet">
          <FleetReportSection
            selectedReport={selectedReport}
            setSelectedReport={setSelectedReport}
            generateReport={generateReport}
          />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerReportSection
            selectedReport={selectedReport}
            setSelectedReport={setSelectedReport}
            generateReport={generateReport}
          />
        </TabsContent>

        <TabsContent value="operational">
          <OperationalReportSection
            selectedReport={selectedReport}
            setSelectedReport={setSelectedReport}
            generateReport={generateReport}
          />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceInsights />
        </TabsContent>

        <TabsContent value="code-analysis">
          <CodeAnalysisDashboard />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;
