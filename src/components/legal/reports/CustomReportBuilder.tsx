import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { ReportFields } from "./components/ReportFields";
import { ReportFilters } from "./components/ReportFilters";
import { ChartTypeSelector } from "./components/ChartTypeSelector";
import { generateReport, exportReport } from "./utils/reportGenerator";

const availableFields = [
  { name: "case_type", label: "Case Type", type: "select" },
  { name: "status", label: "Status", type: "select" },
  { name: "priority", label: "Priority", type: "select" },
  { name: "amount_owed", label: "Amount Owed", type: "number" },
  { name: "created_at", label: "Creation Date", type: "date" },
  { name: "resolution_date", label: "Resolution Date", type: "date" },
];

export const CustomReportBuilder = () => {
  const [reportName, setReportName] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<Array<{ field: string; operator: string; value: string }>>([]);
  const [chartType, setChartType] = useState<string>("none");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFieldToggle = (fieldName: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, key: string, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [key]: value };
    setFilters(newFilters);
  };

  const handleGenerateReport = async () => {
    if (!reportName) {
      toast.error("Please enter a report name");
      return;
    }
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field");
      return;
    }

    setIsGenerating(true);
    try {
      const report = await generateReport({
        reportName,
        selectedFields,
        filters,
        chartType,
      });

      // Store report in local storage for preview
      localStorage.setItem('lastGeneratedReport', JSON.stringify(report));
      
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    const lastReport = localStorage.getItem('lastGeneratedReport');
    if (!lastReport) {
      toast.error("Please generate a report first");
      return;
    }

    try {
      await exportReport(JSON.parse(lastReport), 'csv');
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="report-name" className="block text-sm font-medium">Report Name</label>
          <Input
            id="report-name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Enter report name"
          />
        </div>

        <ReportFields
          availableFields={availableFields}
          selectedFields={selectedFields}
          onFieldToggle={handleFieldToggle}
        />

        <ReportFilters
          availableFields={availableFields}
          filters={filters}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
          onFilterChange={handleFilterChange}
        />

        <ChartTypeSelector
          chartType={chartType}
          onChartTypeChange={setChartType}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            <Printer className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};