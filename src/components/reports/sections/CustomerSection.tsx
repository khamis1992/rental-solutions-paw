import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const CustomerSection = ({ onGenerateReport, onReportTypeChange }: {
  onGenerateReport: () => void;
  onReportTypeChange: (value: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <CustomerAnalytics />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Customer Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={onReportTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer-rental">Rental History</SelectItem>
              <SelectItem value="customer-payment">Payment History</SelectItem>
              <SelectItem value="customer-violations">Traffic Violations</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={onGenerateReport}>Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  );
};