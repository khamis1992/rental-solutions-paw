import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, Clock, DollarSign, Info, Ban } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LegalDocumentDialog } from "./LegalDocumentDialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-32" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const getSeverityColor = (count: number) => {
    if (count === 0) return "secondary";
    if (count <= 2) return "warning";
    return "destructive";
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Ban className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-semibold">Non-Compliant Customers</h2>
          </div>
          <Badge variant="destructive" className="px-3 py-1">
            {overdueCustomers?.length || 0} Issues Found
          </Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Agreement #</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Overdue Payments</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of pending payments past their due date</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Unpaid Fines</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total amount of unpaid traffic fines</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span>Damages</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of reported damages pending resolution</p>
                      </TooltipContent>
                    </Tooltip>
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
                    <Badge variant={getSeverityColor(customer.overdue_payments)}>
                      {customer.overdue_payments}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getSeverityColor(customer.unpaid_fines_amount > 0 ? 3 : 0)}>
                      {formatCurrency(customer.unpaid_fines_amount)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getSeverityColor(customer.damages)}>
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
                    <div className="flex flex-col items-center gap-2">
                      <Ban className="h-8 w-8 text-muted-foreground/50" />
                      <p>No non-compliant customers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <LegalDocumentDialog
        customerId={selectedCustomerId}
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
      />
    </Card>
  );
};