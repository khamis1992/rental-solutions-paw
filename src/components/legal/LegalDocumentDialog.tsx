import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { injectPrintStyles } from "@/lib/printStyles";
import { supabase } from "@/integrations/supabase/client";

interface LegalDocumentDialogProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LegalDocumentDialog({
  customerId,
  open,
  onOpenChange,
}: LegalDocumentDialogProps) {
  const { data: customerData, isLoading } = useQuery({
    queryKey: ["legal-document", customerId],
    queryFn: async () => {
      if (!customerId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          leases (
            id,
            payment_schedules (
              id,
              due_date,
              amount,
              status
            ),
            traffic_fines (
              id,
              violation_date,
              fine_amount,
              fine_type,
              payment_status
            ),
            damages (
              id,
              description,
              repair_cost,
              reported_date,
              status
            )
          )
        `)
        .eq("id", customerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: open && !!customerId,
  });

  const handlePrint = () => {
    injectPrintStyles();
    window.print();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Legal Document - {customerData?.full_name}</span>
            <Button onClick={handlePrint} className="print:hidden">
              <Printer className="h-4 w-4 mr-2" />
              Print Document
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            {isLoading ? (
              <div>Loading customer details...</div>
            ) : customerData ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Customer Information</h3>
                  <p>Name: {customerData.full_name}</p>
                  <p>Address: {customerData.address}</p>
                  <p>Phone: {customerData.phone_number}</p>
                </div>

                {customerData.leases?.map((lease: any) => (
                  <div key={lease.id} className="space-y-4">
                    {lease.payment_schedules?.some((payment: any) => payment.status === 'pending') && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Overdue Payments</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          {lease.payment_schedules
                            .filter((payment: any) => payment.status === 'pending')
                            .map((payment: any) => (
                              <li key={payment.id}>
                                Due Date: {format(new Date(payment.due_date), "PP")} - 
                                Amount: {formatCurrency(payment.amount)}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {lease.traffic_fines?.some((fine: any) => fine.payment_status === 'pending') && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Unpaid Traffic Fines</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          {lease.traffic_fines
                            .filter((fine: any) => fine.payment_status === 'pending')
                            .map((fine: any) => (
                              <li key={fine.id}>
                                Date: {format(new Date(fine.violation_date), "PP")} - 
                                Type: {fine.fine_type} - 
                                Amount: {formatCurrency(fine.fine_amount)}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {lease.damages?.some((damage: any) => damage.status === 'pending') && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Unresolved Vehicle Damages</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          {lease.damages
                            .filter((damage: any) => damage.status === 'pending')
                            .map((damage: any) => (
                              <li key={damage.id}>
                                Reported: {format(new Date(damage.reported_date), "PP")} - 
                                {damage.description} - 
                                Repair Cost: {damage.repair_cost ? formatCurrency(damage.repair_cost) : "Pending Assessment"}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-8 pt-8 border-t">
                  <p className="text-sm text-muted-foreground">
                    This document was generated on {format(new Date(), "PPpp")} and represents the current status
                    of outstanding obligations. All amounts are subject to additional late fees and penalties as
                    specified in the rental agreement.
                  </p>
                </div>
              </>
            ) : (
              <div>Customer not found</div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}