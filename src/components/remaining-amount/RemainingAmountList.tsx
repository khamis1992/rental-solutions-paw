import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface RemainingAmount {
  id: string;
  agreement_number: string;
  license_plate: string;
  rent_amount: number;
  final_price: number;
  amount_paid: number;
  remaining_amount: number;
  agreement_duration: string;
}

export function RemainingAmountList() {
  const { data: remainingAmounts, isLoading } = useQuery({
    queryKey: ['remaining-amounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remaining_amounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RemainingAmount[];
    },
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
            <TableHead>License Plate</TableHead>
            <TableHead className="text-right">Rent Amount</TableHead>
            <TableHead className="text-right">Final Price</TableHead>
            <TableHead className="text-right">Amount Paid</TableHead>
            <TableHead className="text-right">Remaining Amount</TableHead>
            <TableHead>Agreement Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {remainingAmounts?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.agreement_number}</TableCell>
              <TableCell>{item.license_plate}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.rent_amount)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.final_price)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.amount_paid)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.remaining_amount)}</TableCell>
              <TableCell>{item.agreement_duration}</TableCell>
            </TableRow>
          ))}
          {!remainingAmounts?.length && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No remaining amounts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}