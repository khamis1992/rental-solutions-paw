import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LegalDocumentDialog } from "./LegalDocumentDialog";
import { Badge } from "@/components/ui/badge";

interface NonCompliantCustomer {
  id: string;
  customer_id: string;
  agreement_number: string;
  customer_name: string;
  overdue_payments: number;
  unpaid_fines_amount: number;
  damages: number;
}

export const NonCompliantCustomers = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const { data: overdueCustomers, isLoading } = useQuery({
    queryKey: ["overdue-customers"],
    queryFn: async () => {
      console.log("Fetching overdue customers data");
      
      try {
        const { data, error } = await supabase
          .from('leases')
          .select(`
            id,
            customer_id,
            agreement_number,
            profiles:customer_id (
              id,
              full_name
            ),
            payment_schedules (
              id,
              status
            ),
            traffic_fines (
              id,
              payment_status,
              fine_amount
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
          unpaid_fines_amount: lease.traffic_fines?.reduce((sum, fine) => 
            fine.payment_status === 'pending' ? sum + (fine.fine_amount || 0) : sum, 0) || 0,
          damages: lease.damages?.filter(d => d.status === 'pending').length || 0
        }));

        console.log("Processed customer data:", processedData);
        return processedData as NonCompliantCustomer[];
      } catch (err) {
        console.error("Error fetching overdue customers:", err);
        throw err;
      }
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
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Non-Compliant Customers</h2>
          <Badge variant="destructive" className="px-3 py-1">
            {overdueCustomers?.length || 0} Issues Found
          </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Agreement #</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="h-4 w-4" />
                  Overdue Payments
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <DollarSign className="h-4 w-4" />
                  Unpaid Fines
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <AlertTriangle className="h-4 w-4" />
                  Damages
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overdueCustomers?.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{customer.agreement_number}</TableCell>
                <TableCell>{customer.customer_name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={customer.overdue_payments > 0 ? "destructive" : "secondary"}>
                    {customer.overdue_payments}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={customer.unpaid_fines_amount > 0 ? "destructive" : "secondary"}>
                    {formatCurrency(customer.unpaid_fines_amount)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={customer.damages > 0 ? "destructive" : "secondary"}>
                    {customer.damages}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomerId(customer.customer_id);
                      setDocumentDialogOpen(true);
                    }}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Document
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!overdueCustomers?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No non-compliant customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <LegalDocumentDialog
        customerId={selectedCustomerId}
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
      />
    </Card>
  );
};