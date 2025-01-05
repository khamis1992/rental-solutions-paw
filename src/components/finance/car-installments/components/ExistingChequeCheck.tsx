import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface ExistingChequeCheckProps {
  contractId: string;
  chequeNumbers: string[];
}

export const ExistingChequeCheck = ({ contractId, chequeNumbers }: ExistingChequeCheckProps) => {
  const { data: existingCheques, isLoading } = useQuery({
    queryKey: ['existing-cheques', contractId, chequeNumbers],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_installment_payments')
        .select('*')
        .eq('contract_id', contractId)
        .in('cheque_number', chequeNumbers);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Checking existing cheques...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cheque Numbers Check</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cheque Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chequeNumbers.map((chequeNumber) => {
              const existingCheque = existingCheques?.find(
                (cheque) => cheque.cheque_number === chequeNumber
              );

              return (
                <TableRow key={chequeNumber}>
                  <TableCell>{chequeNumber}</TableCell>
                  <TableCell>
                    {existingCheque ? (
                      <span className="text-red-500">Already exists</span>
                    ) : (
                      <span className="text-green-500">Available</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {existingCheque ? formatCurrency(existingCheque.amount) : '-'}
                  </TableCell>
                  <TableCell>
                    {existingCheque?.payment_date
                      ? format(new Date(existingCheque.payment_date), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};