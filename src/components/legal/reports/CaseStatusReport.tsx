import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface CaseStatusReportProps {
  data: any[];
}

export const CaseStatusReport = ({ data }: CaseStatusReportProps) => {
  const statusCounts = data.reduce((acc: Record<string, number>, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const monthlyTrends = data.reduce((acc: Record<string, number>, curr) => {
    const month = format(new Date(curr.created_at), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Case Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(statusCounts).map(([status, count]) => (
                <TableRow key={status}>
                  <TableCell className="font-medium">{status}</TableCell>
                  <TableCell>{count}</TableCell>
                  <TableCell>
                    {((count / data.length) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Case Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>New Cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(monthlyTrends).map(([month, count]) => (
                <TableRow key={month}>
                  <TableCell className="font-medium">{month}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};