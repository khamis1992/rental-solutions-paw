import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0">
            <TableRow>
              <TableHead className="font-semibold">Agreement Number</TableHead>
              <TableHead className="font-semibold">License Plate</TableHead>
              <TableHead className="text-right font-semibold">Rent Amount</TableHead>
              <TableHead className="text-right font-semibold">Final Price</TableHead>
              <TableHead className="text-right font-semibold">Amount Paid</TableHead>
              <TableHead className="text-right font-semibold">Remaining Amount</TableHead>
              <TableHead className="font-semibold">Agreement Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {remainingAmounts?.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{item.agreement_number}</TableCell>
                <TableCell>{item.license_plate}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.rent_amount)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.final_price)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.amount_paid)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-blue-600">
                  {formatCurrency(item.remaining_amount)}
                </TableCell>
                <TableCell>{item.agreement_duration}</TableCell>
              </TableRow>
            ))}
            {!remainingAmounts?.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No remaining amounts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}