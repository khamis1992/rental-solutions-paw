import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: customerData } = useQuery({
    queryKey: ["customer-analytics"],
    queryFn: async () => {
      const { data: customers, error } = await supabase
        .from("profiles")
        .select(`
          *,
          leases (
            id,
            start_date
          )
        `);

      if (error) throw error;
      return customers;
    },
  });

  const totalCustomers = customerData?.length || 0;
  const retentionRate = 85; // Simulated retention rate
  const satisfaction = 4.8; // Simulated satisfaction score

  // Calculate month-over-month growth
  const growth = 5.2; // Simulated growth rate

  return (
    <div className="space-y-6">
      {/* Analytics Summary Cards - Top */}
      <div className="grid gap-4 md:grid-cols-3">
        <CustomerAnalytics />
      </div>

      {/* Reports Selection Card - Middle */}
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

      {/* Customer Acquisition Chart - Bottom */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Acquisition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerData?.map(customer => ({
                date: new Date(customer.created_at).toLocaleDateString(),
                customers: 1
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#82ca9d" 
                  name="New Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
