import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";

interface CustomerReportSectionProps {
  selectedReport: string;
  setSelectedReport: (value: string) => void;
  generateReport: () => void;
}

export const CustomerReportSection = ({
  selectedReport,
  setSelectedReport,
  generateReport
}: CustomerReportSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Reports Selection Card - Moved to top */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Customer Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={value => setSelectedReport(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer-rental">Rental History</SelectItem>
              <SelectItem value="customer-payment">Payment History</SelectItem>
              <SelectItem value="customer-violations">Traffic Violations</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={generateReport}>Generate Report</Button>
        </CardContent>
      </Card>

      {/* Analytics Card - Moved to bottom */}
      <CustomerAnalytics />
    </div>
  );
};