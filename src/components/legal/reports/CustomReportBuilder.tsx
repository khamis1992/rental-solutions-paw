import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, FileText, ChartBar, ChartPie, ChartLine, Filter, Download, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface ReportField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

export const CustomReportBuilder = () => {
  const [reportName, setReportName] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [chartType, setChartType] = useState<string>("none");

  const availableFields: ReportField[] = [
    { name: "case_type", label: "Case Type", type: "select" },
    { name: "status", label: "Status", type: "select" },
    { name: "priority", label: "Priority", type: "select" },
    { name: "amount_owed", label: "Amount Owed", type: "number" },
    { name: "created_at", label: "Creation Date", type: "date" },
    { name: "resolution_date", label: "Resolution Date", type: "date" },
  ];

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFieldToggle = (fieldName: string) => {
    if (selectedFields.includes(fieldName)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldName));
    } else {
      setSelectedFields([...selectedFields, fieldName]);
    }
  };

  const generateReport = async () => {
    if (!reportName) {
      toast.error("Please enter a report name");
      return;
    }
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field");
      return;
    }

    toast.success("Generating report...");
    // Report generation logic will be implemented here
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
        {/* Report Name */}
        <div className="space-y-2">
          <Label htmlFor="report-name">Report Name</Label>
          <Input
            id="report-name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Enter report name"
          />
        </div>

        {/* Field Selection */}
        <div className="space-y-2">
          <Label>Select Fields</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableFields.map((field) => (
              <Button
                key={field.name}
                variant={selectedFields.includes(field.name) ? "default" : "outline"}
                onClick={() => handleFieldToggle(field.name)}
                className="justify-start"
              >
                {field.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Filters</Label>
            <Button variant="outline" size="sm" onClick={addFilter}>
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select value={filter.field} onValueChange={(value) => {
                  const newFilters = [...filters];
                  newFilters[index].field = value;
                  setFilters(newFilters);
                }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filter.operator} onValueChange={(value) => {
                  const newFilters = [...filters];
                  newFilters[index].operator = value;
                  setFilters(newFilters);
                }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater_than">Greater than</SelectItem>
                    <SelectItem value="less_than">Less than</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={filter.value}
                  onChange={(e) => {
                    const newFilters = [...filters];
                    newFilters[index].value = e.target.value;
                    setFilters(newFilters);
                  }}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button variant="destructive" size="icon" onClick={() => removeFilter(index)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Visualization Options */}
        <div className="space-y-2">
          <Label>Visualization Type</Label>
          <div className="flex gap-2">
            <Button
              variant={chartType === "none" ? "default" : "outline"}
              onClick={() => setChartType("none")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Table
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              onClick={() => setChartType("bar")}
            >
              <ChartBar className="h-4 w-4 mr-2" />
              Bar Chart
            </Button>
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              onClick={() => setChartType("pie")}
            >
              <ChartPie className="h-4 w-4 mr-2" />
              Pie Chart
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              onClick={() => setChartType("line")}
            >
              <ChartLine className="h-4 w-4 mr-2" />
              Line Chart
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={generateReport}>
            <Printer className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};