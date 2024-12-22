import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { AuditRecordsList } from "./AuditRecordsList";
import { AuditRecordForm } from "./AuditRecordForm";

export function AuditRecordsDashboard() {
  const { data: auditStats } = useQuery({
    queryKey: ["audit-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_records")
        .select("status")
        .then(result => {
          // Count occurrences of each status
          const counts = result.data?.reduce((acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Convert to array format expected by the component
          return Object.entries(counts || {}).map(([status, count]) => ({
            status,
            count
          }));
        });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: upcomingDeadlines } = useQuery({
    queryKey: ["upcoming-audit-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_records")
        .select("*")
        .gte("submission_deadline", new Date().toISOString())
        .order("submission_deadline")
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Audit Records Management</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Audits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditStats?.find(s => s.status === "pending")?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Audits</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {auditStats?.find(s => s.status === "overdue")?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Audits</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {auditStats?.find(s => s.status === "completed")?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {upcomingDeadlines && upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingDeadlines.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Year {audit.audit_year} Audit</span>
                  </div>
                  <span className="text-muted-foreground">
                    Due: {format(new Date(audit.submission_deadline), "MMM d, yyyy")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Audit Records</TabsTrigger>
          <TabsTrigger value="new">New Audit Record</TabsTrigger>
        </TabsList>
        <TabsContent value="records">
          <AuditRecordsList />
        </TabsContent>
        <TabsContent value="new">
          <AuditRecordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}