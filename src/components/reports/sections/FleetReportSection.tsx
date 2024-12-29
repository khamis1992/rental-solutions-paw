import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { FleetStatus } from "@/components/reports/FleetStatus";

interface FleetReportSectionProps {
  selectedReport: string;
  setSelectedReport: (value: string) => void;
  generateReport: () => void;
}

export const FleetReportSection = ({
  selectedReport,
  setSelectedReport,
  generateReport
}: FleetReportSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={value => setSelectedReport(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vehicle-summary">Vehicle Summary Report</SelectItem>
                <SelectItem value="vehicle-maintenance">Maintenance History</SelectItem>
                <SelectItem value="vehicle-utilization">Vehicle Utilization Report</SelectItem>
                <SelectItem value="vehicle-expenses">Vehicle Expense Report</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={generateReport}>Generate Report</Button>
          </CardContent>
        </Card>
        <FleetStatus />
      </div>
    </div>
  );
};