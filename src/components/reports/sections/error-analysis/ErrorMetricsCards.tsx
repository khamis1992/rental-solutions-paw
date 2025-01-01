import { Bug, Code, FileSearch, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorMetricsCardsProps {
  errorLogs: any[];
}

export const ErrorMetricsCards = ({ errorLogs = [] }: ErrorMetricsCardsProps) => {
  const getErrorDetails = (log: any) => {
    return typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors || {};
  };

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-red-500" />
            <p className="text-2xl font-bold">
              {errorLogs.filter(log => getErrorDetails(log).severity === 'high').length || 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Code Quality Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-amber-500" />
            <p className="text-2xl font-bold">
              {errorLogs.filter(log => getErrorDetails(log).error_type === 'code_quality').length || 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <p className="text-2xl font-bold">
              {errorLogs ? 
                `${Math.round((errorLogs.filter(log => log.status === 'resolved').length / errorLogs.length) * 100)}%` 
                : '0%'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Files Analyzed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-blue-500" />
            <p className="text-2xl font-bold">
              {new Set(errorLogs?.map(log => getErrorDetails(log).file_name)).size || 0}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};