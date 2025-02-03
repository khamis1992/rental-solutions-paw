import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type CarInstallmentPayment, type CarInstallmentPaymentsProps } from "@/types/finance/car-installment.types";

export const CarInstallmentPayments = ({ contractId, payments }: CarInstallmentPaymentsProps) => {
  if (!payments?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No payments found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Installments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cheque Number</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid Amount</TableHead>
                <TableHead className="text-right">Remaining Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.cheque_number}</TableCell>
                  <TableCell>{format(new Date(payment.payment_date), "PP")}</TableCell>
                  <TableCell>{payment.drawee_bank}</TableCell>
                  <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell 
                    className={cn(
                      "text-right font-medium",
                      payment.paid_amount >= payment.amount ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatCurrency(payment.paid_amount)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(payment.remaining_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      )}
                    >
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};