import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FleetStatus } from "@/components/reports/FleetStatus";
import { CustomerAnalytics } from "@/components/reports/CustomerAnalytics";
import { PerformanceInsights } from "@/components/performance/PerformanceInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Users, Brain, Car, FileSpreadsheet, Calendar } from "lucide-react";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive insights into your fleet operations and business performance.
        </p>
      </div>

      <Tabs defaultValue="fleet" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-lg flex flex-wrap gap-2">
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Fleet Reports
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Reports
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Operational Reports
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Performance Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet">
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Vehicle Summary Report</SelectItem>
                      <SelectItem value="maintenance">Maintenance History</SelectItem>
                      <SelectItem value="utilization">Vehicle Utilization Report</SelectItem>
                      <SelectItem value="expenses">Vehicle Expense Report</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>
              <FleetStatus />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customer">
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental-history">Rental History</SelectItem>
                    <SelectItem value="payment-history">Payment History</SelectItem>
                    <SelectItem value="traffic-violations">Traffic Violations</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Operational Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active-rentals">Active Rentals Report</SelectItem>
                    <SelectItem value="maintenance-schedule">Maintenance Schedule</SelectItem>
                    <SelectItem value="upcoming-returns">Upcoming Returns</SelectItem>
                    <SelectItem value="late-returns">Late Returns Report</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceInsights />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;