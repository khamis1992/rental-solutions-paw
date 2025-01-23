import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export interface CustomerReportSectionProps {
  selectedReport: string;
  setSelectedReport: (report: string) => void;
  generateReport: () => Promise<void>;
}

export const CustomerReportSection = ({
  selectedReport,
  setSelectedReport,
  generateReport,
}: CustomerReportSectionProps) => {
  const [customerId, setCustomerId] = useState("");

  const handleGenerateReport = async () => {
    if (!customerId) {
      toast.error("Please enter a customer ID");
      return;
    }
    await generateReport();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Enter customer ID"
            />
          </div>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>
      </CardContent>
    </Card>
  );
};
