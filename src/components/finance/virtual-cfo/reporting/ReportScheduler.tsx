import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";

export const ReportScheduler = () => {
  const [schedule, setSchedule] = useState({
    reportType: "financial",
    frequency: "weekly",
    recipients: "",
    format: "pdf"
  });

  const { data: scheduledReports } = useQuery({
    queryKey: ["scheduled-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleScheduleReport = async () => {
    try {
      const { error } = await supabase
        .from("report_schedules")
        .insert([{
          report_type: schedule.reportType,
          frequency: schedule.frequency,
          recipients: schedule.recipients.split(",").map(email => email.trim()),
          format: schedule.format
        }]);

      if (error) throw error;
      toast.success("Report scheduled successfully");
    } catch (error) {
      toast.error("Failed to schedule report");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Report Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select
                value={schedule.reportType}
                onValueChange={(value) => setSchedule({ ...schedule, reportType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Overview</SelectItem>
                  <SelectItem value="profitability">Profitability Analysis</SelectItem>
                  <SelectItem value="expenses">Expense Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <Select
                value={schedule.frequency}
                onValueChange={(value) => setSchedule({ ...schedule, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Recipients (comma-separated emails)</label>
            <Input
              value={schedule.recipients}
              onChange={(e) => setSchedule({ ...schedule, recipients: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select
              value={schedule.format}
              onValueChange={(value) => setSchedule({ ...schedule, format: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full mt-4"
            onClick={handleScheduleReport}
          >
            Schedule Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};