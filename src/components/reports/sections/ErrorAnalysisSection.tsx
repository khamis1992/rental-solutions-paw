import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const ErrorAnalysisSection = () => {
  const { data: errors, isLoading, refetch } = useQuery({
    queryKey: ["error-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const handleAnalyze = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-import-errors', {
        body: { errors }
      });

      if (error) throw error;
      await refetch();
      toast.success("Error analysis completed");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze errors");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getErrorRate = () => {
    if (!errors?.length) return 0;
    const errorCount = errors.filter(e => e.status === 'error').length;
    return ((errorCount / errors.length) * 100).toFixed(1);
  };

  const getSuccessRate = () => {
    if (!errors?.length) return 0;
    const successCount = errors.filter(e => e.status === 'success').length;
    return ((successCount / errors.length) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Error Analysis Dashboard</h2>
        </div>
        <Button onClick={handleAnalyze} variant="outline" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Analyze Errors
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-2xl font-bold">{errors?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <p className="text-2xl font-bold">{getErrorRate()}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold">{getSuccessRate()}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Import Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading error data...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Import Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records Processed</TableHead>
                    <TableHead>Error Details</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors?.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell className="font-medium">{error.import_type}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(error.status)}`}>
                          {error.status === 'success' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {error.status}
                        </span>
                      </TableCell>
                      <TableCell>{error.records_processed}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {error.errors ? JSON.stringify(error.errors) : 'No errors'}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};