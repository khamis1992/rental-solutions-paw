import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { TaxFilingList } from "./TaxFilingList";
import { TaxFilingForm } from "./TaxFilingForm";

type TaxFilingStatus = {
  status: string;
  count: number;
};

export function TaxFilingDashboard() {
  const { data: taxStats = [] } = useQuery<TaxFilingStatus[]>({
    queryKey: ["tax-filing-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_filings")
        .select("status");

      if (error) throw error;

      // Count occurrences of each status
      const counts = (data || []).reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Convert to array format expected by the component
      return Object.entries(counts).map(([status, count]) => ({
        status,
        count
      }));
    },
  });

  const { data: upcomingDeadlines } = useQuery({
    queryKey: ["upcoming-tax-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_filings")
        .select("*")
        .gte("due_date", new Date().toISOString())
        .order("due_date")
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tax Filing Management</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Filings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taxStats?.find(s => s.status === "pending")?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Filings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {taxStats?.find(s => s.status === "rejected")?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Filings</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {taxStats?.find(s => s.status === "accepted")?.count || 0}
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
              {upcomingDeadlines.map((filing) => (
                <div
                  key={filing.id}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{filing.filing_type}</span>
                  </div>
                  <span className="text-muted-foreground">
                    Due: {format(new Date(filing.due_date), "MMM d, yyyy")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="filings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="filings">Tax Filings</TabsTrigger>
          <TabsTrigger value="new">New Filing</TabsTrigger>
        </TabsList>
        <TabsContent value="filings">
          <TaxFilingList />
        </TabsContent>
        <TabsContent value="new">
          <TaxFilingForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}