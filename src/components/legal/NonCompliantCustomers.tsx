import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface NonCompliantCustomer {
  id: string;
  agreement_number: string;
  customer_name: string;
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
          profiles:customer_id (
            full_name
          )
        `)
        .eq('status', 'active')
        .order('agreement_number');

      if (error) throw error;

      const processedData = data.map(lease => ({
        id: lease.id,
        agreement_number: lease.agreement_number,
        customer_name: lease.profiles?.full_name || 'Unknown'
      }));

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {overdueCustomers?.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.agreement_number}</TableCell>
              <TableCell>{customer.customer_name}</TableCell>
            </TableRow>
          ))}
          {!overdueCustomers?.length && (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-4">
                No overdue payments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};