import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { formatDateToDisplay } from "@/lib/dateUtils";

interface NonCompliantCustomer {
  id: string;
  agreement_number: string;
  customer_name: string;
  remaining_amount: number;
  last_payment_date: string | null;
  next_payment_date: string | null;
  days_overdue: number;
  total_late_fees: number;
}

export const NonCompliantCustomers = () => {
  const { data: overdueCustomers, isLoading } = useQuery({
    queryKey: ["overdue-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          agreement_number,
          last_payment_date,
          next_payment_date,
          profiles:customer_id (
            full_name
          ),
          remaining_amounts (
            remaining_amount
          )
        `)
        .eq('status', 'active')
        .order('next_payment_date');

      if (error) throw error;

      const processedData = data.map(lease => {
        const daysOverdue = lease.next_payment_date 
          ? Math.max(0, Math.floor((new Date().getTime() - new Date(lease.next_payment_date).getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        return {
          id: lease.id,
          agreement_number: lease.agreement_number,
          customer_name: lease.profiles?.full_name || 'Unknown',
          remaining_amount: lease.remaining_amounts?.[0]?.remaining_amount || 0,
          last_payment_date: lease.last_payment_date,
          next_payment_date: lease.next_payment_date,
          days_overdue: daysOverdue,
          total_late_fees: daysOverdue * 120 // 120 QAR daily late fee
        };
      });

      return processedData as NonCompliantCustomer[];
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agreement Number</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead className="text-right">Remaining Amount</TableHead>
            <TableHead>Last Payment</TableHead>
            <TableHead>Next Payment</TableHead>
            <TableHead className="text-right">Days Overdue</TableHead>
            <TableHead className="text-right">Late Fees</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {overdueCustomers?.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.agreement_number}</TableCell>
              <TableCell>{customer.customer_name}</TableCell>
              <TableCell className="text-right">{formatCurrency(customer.remaining_amount)}</TableCell>
              <TableCell>{customer.last_payment_date ? formatDateToDisplay(customer.last_payment_date) : '-'}</TableCell>
              <TableCell>{customer.next_payment_date ? formatDateToDisplay(customer.next_payment_date) : '-'}</TableCell>
              <TableCell className="text-right">{customer.days_overdue}</TableCell>
              <TableCell className="text-right">{formatCurrency(customer.total_late_fees)}</TableCell>
            </TableRow>
          ))}
          {!overdueCustomers?.length && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No overdue payments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};