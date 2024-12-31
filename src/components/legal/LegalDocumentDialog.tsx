import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, FileText, AlertCircle, Clock, DollarSign } from "lucide-react";
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
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Legal Document - {customerData?.full_name}</span>
            </div>
            <Button onClick={handlePrint} className="print:hidden">
              <Printer className="h-4 w-4 mr-2" />
              Print Document
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : customerData ? (
              <>
                <div className="space-y-4 bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{customerData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{customerData.phone_number}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{customerData.address}</p>
                    </div>
                  </div>
                </div>

                {customerData.leases?.map((lease: any) => (
                  <div key={lease.id} className="space-y-6">
                    {lease.payment_schedules?.some((payment: any) => payment.status === 'pending') && (
                      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
                          <Clock className="h-4 w-4" />
                          Overdue Payments
                        </h3>
                        <ul className="space-y-2">
                          {lease.payment_schedules
                            .filter((payment: any) => payment.status === 'pending')
                            .map((payment: any) => (
                              <li key={payment.id} className="flex justify-between items-center text-red-600 dark:text-red-400">
                                <span>{format(new Date(payment.due_date), "PP")}</span>
                                <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {lease.traffic_fines?.some((fine: any) => fine.payment_status === 'pending') && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                          <DollarSign className="h-4 w-4" />
                          Unpaid Traffic Fines
                        </h3>
                        <ul className="space-y-2">
                          {lease.traffic_fines
                            .filter((fine: any) => fine.payment_status === 'pending')
                            .map((fine: any) => (
                              <li key={fine.id} className="flex justify-between items-center text-yellow-600 dark:text-yellow-400">
                                <div>
                                  <p className="font-medium">{fine.fine_type}</p>
                                  <p className="text-sm">{format(new Date(fine.violation_date), "PP")}</p>
                                </div>
                                <span className="font-semibold">{formatCurrency(fine.fine_amount)}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {lease.damages?.some((damage: any) => damage.status === 'pending') && (
                      <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-orange-700 dark:text-orange-400">
                          <AlertCircle className="h-4 w-4" />
                          Unresolved Vehicle Damages
                        </h3>
                        <ul className="space-y-2">
                          {lease.damages
                            .filter((damage: any) => damage.status === 'pending')
                            .map((damage: any) => (
                              <li key={damage.id} className="text-orange-600 dark:text-orange-400">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{damage.description}</p>
                                    <p className="text-sm">Reported: {format(new Date(damage.reported_date), "PP")}</p>
                                  </div>
                                  <span className="font-semibold">
                                    {damage.repair_cost ? formatCurrency(damage.repair_cost) : "Pending Assessment"}
                                  </span>
                                </div>
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
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Customer not found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}