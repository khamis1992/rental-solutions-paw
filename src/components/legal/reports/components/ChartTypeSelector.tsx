import { Button } from "@/components/ui/button";
import { FileText, ChartBar, ChartPie, ChartLine } from "lucide-react";

interface ChartTypeSelectorProps {
  chartType: string;
  onChartTypeChange: (type: string) => void;
}

export const ChartTypeSelector = ({
  chartType,
  onChartTypeChange,
}: ChartTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Visualization Type</label>
      <div className="flex gap-2">
        <Button
          variant={chartType === "none" ? "default" : "outline"}
          onClick={() => onChartTypeChange("none")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Table
        </Button>
        <Button
          variant={chartType === "bar" ? "default" : "outline"}
          onClick={() => onChartTypeChange("bar")}
        >
          <ChartBar className="h-4 w-4 mr-2" />
          Bar Chart
        </Button>
        <Button
          variant={chartType === "pie" ? "default" : "outline"}
          onClick={() => onChartTypeChange("pie")}
        >
          <ChartPie className="h-4 w-4 mr-2" />
          Pie Chart
        </Button>
        <Button
          variant={chartType === "line" ? "default" : "outline"}
          onClick={() => onChartTypeChange("line")}
        >
          <ChartLine className="h-4 w-4 mr-2" />
          Line Chart
        </Button>
      </div>
    </div>
  );
};