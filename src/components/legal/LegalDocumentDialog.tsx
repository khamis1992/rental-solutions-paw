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
  };

  if (isLoading || !customerData) {
    return null;
  }

  const overduePayments = customerData.leases?.flatMap(lease => 
    lease.payment_schedules?.filter(payment => 
      payment.status === 'pending'
    ) || []
  );

  const unpaidFines = customerData.leases?.flatMap(lease =>
    lease.traffic_fines?.filter(fine =>
      fine.payment_status === 'pending'
    ) || []
  );

  const unresolvedDamages = customerData.leases?.flatMap(lease =>
    lease.damages?.filter(damage =>
      damage.status === 'pending'
    ) || []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Legal Document - {customerData.full_name}</span>
            <Button onClick={handlePrint} className="print:hidden">
              <Printer className="h-4 w-4 mr-2" />
              Print Document
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <p>Name: {customerData.full_name}</p>
              <p>Address: {customerData.address}</p>
              <p>Phone: {customerData.phone_number}</p>
            </div>

            {overduePayments && overduePayments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Overdue Payments</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {overduePayments.map(payment => (
                    <li key={payment.id}>
                      Due Date: {format(new Date(payment.due_date), "PP")} - Amount: {formatCurrency(payment.amount)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {unpaidFines && unpaidFines.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Unpaid Traffic Fines</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {unpaidFines.map(fine => (
                    <li key={fine.id}>
                      Date: {format(new Date(fine.violation_date), "PP")} - Type: {fine.fine_type} - Amount: {formatCurrency(fine.fine_amount)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {unresolvedDamages && unresolvedDamages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Unresolved Vehicle Damages</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {unresolvedDamages.map(damage => (
                    <li key={damage.id}>
                      Reported: {format(new Date(damage.reported_date), "PP")} - {damage.description} - 
                      Repair Cost: {damage.repair_cost ? formatCurrency(damage.repair_cost) : "Pending Assessment"}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Total Outstanding Amount</h3>
              <p className="text-xl font-bold">
                {formatCurrency(
                  (overduePayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0) +
                  (unpaidFines?.reduce((sum, fine) => sum + fine.fine_amount, 0) || 0) +
                  (unresolvedDamages?.reduce((sum, damage) => sum + (damage.repair_cost || 0), 0) || 0)
                )}
              </p>
            </div>

            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                This document was generated on {format(new Date(), "PPpp")} and represents the current status
                of outstanding obligations. All amounts are subject to additional late fees and penalties as
                specified in the rental agreement.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}