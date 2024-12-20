import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const OperationalSection = ({ onGenerateReport, onReportTypeChange }: {
  onGenerateReport: () => void;
  onReportTypeChange: (value: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Operational Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={onReportTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational-active">Active Rentals Report</SelectItem>
              <SelectItem value="operational-maintenance">Maintenance Schedule</SelectItem>
              <SelectItem value="operational-returns">Upcoming Returns</SelectItem>
              <SelectItem value="operational-late">Late Returns Report</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={onGenerateReport}>Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  );
};