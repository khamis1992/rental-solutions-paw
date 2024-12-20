import { FleetStatus } from "@/components/reports/FleetStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export const FleetSection = ({ onGenerateReport, onReportTypeChange }: {
  onGenerateReport: () => void;
  onReportTypeChange: (value: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={onReportTypeChange}>
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
            <Button className="w-full" onClick={onGenerateReport}>Generate Report</Button>
          </CardContent>
        </Card>
        <FleetStatus />
      </div>
    </div>
  );
};