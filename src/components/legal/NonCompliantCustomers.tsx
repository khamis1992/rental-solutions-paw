import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LegalDocumentDialog } from "./LegalDocumentDialog";

interface NonCompliantCustomer {
  id: string;
  customer_id: string;
  agreement_number: string;
  customer_name: string;
  overdue_payments: number;
  unpaid_fines: number;
  damages: number;
}

export const NonCompliantCustomers = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const { data: overdueCustomers, isLoading } = useQuery({
    queryKey: ["overdue-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          customer_id,
          agreement_number,
          profiles:customer_id (
            full_name
          ),
          payment_schedules (
            id,
            status
          ),
          traffic_fines (
            id,
            payment_status
          ),
          damages (
            id,
            status
          )
        `)
        .eq('status', 'active')
        .order('agreement_number');

      if (error) throw error;

      const processedData = data.map(lease => ({
        id: lease.id,
        customer_id: lease.customer_id,
        agreement_number: lease.agreement_number,
        customer_name: lease.profiles?.full_name || 'Unknown',
        overdue_payments: lease.payment_schedules?.filter(p => p.status === 'pending').length || 0,
        unpaid_fines: lease.traffic_fines?.filter(f => f.payment_status === 'pending').length || 0,
        damages: lease.damages?.filter(d => d.status === 'pending').length || 0
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
            <TableHead className="text-center">Overdue Payments</TableHead>
            <TableHead className="text-center">Unpaid Fines</TableHead>
            <TableHead className="text-center">Damages</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {overdueCustomers?.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.agreement_number}</TableCell>
              <TableCell>{customer.customer_name}</TableCell>
              <TableCell className="text-center">{customer.overdue_payments}</TableCell>
              <TableCell className="text-center">{customer.unpaid_fines}</TableCell>
              <TableCell className="text-center">{customer.damages}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomerId(customer.customer_id);
                    setDocumentDialogOpen(true);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Document
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!overdueCustomers?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No overdue payments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <LegalDocumentDialog
        customerId={selectedCustomerId}
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
      />
    </Card>
  );
};