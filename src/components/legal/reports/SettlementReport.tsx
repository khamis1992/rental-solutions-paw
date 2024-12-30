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
import { formatCurrency } from "@/lib/utils";

interface SettlementReportProps {
  data: Array<{
    total_amount: number;
    paid_amount: number;
    created_at: string;
    [key: string]: any;
  }>;
}

export const SettlementReport = ({ data }: SettlementReportProps) => {
  const totalSettlements = data.length;
  const totalAmount = data.reduce((sum, item) => sum + (item.total_amount || 0), 0);
  const totalPaid = data.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
  const averageSettlement = totalAmount / (totalSettlements || 1);

  const monthlySettlements = data.reduce((acc: Record<string, number>, curr) => {
    const month = format(new Date(curr.created_at), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + curr.total_amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSettlements}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Settlement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSettlement)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Settlement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(monthlySettlements).map(([month, amount]) => (
                <TableRow key={month}>
                  <TableCell className="font-medium">{month}</TableCell>
                  <TableCell>{formatCurrency(amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};