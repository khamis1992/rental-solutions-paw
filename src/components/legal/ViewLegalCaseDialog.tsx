import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ViewLegalCaseDialogProps {
  caseId: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ViewLegalCaseDialog({ caseId, onOpenChange, open }: ViewLegalCaseDialogProps) {
  const { data: legalCase } = useQuery({
    queryKey: ['legal-case', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from('legal_cases')
        .select(`
          *,
          customer:profiles!legal_cases_customer_id_fkey (
            full_name
          ),
          assigned_to_user:profiles!legal_cases_assigned_to_fkey (
            full_name
          )
        `)
        .eq('id', caseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!caseId
  });

  if (!legalCase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legal Case Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Customer</h3>
              <p>{legalCase.customer?.full_name || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium">Assigned To</h3>
              <p>{legalCase.assigned_to_user?.full_name || 'Unassigned'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Description</h3>
            <p>{legalCase.description || 'No description provided'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Case Type</h3>
              <p>{legalCase.case_type}</p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <Badge>{legalCase.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Amount Owed</h3>
              <p>${legalCase.amount_owed.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="font-medium">Created At</h3>
              <p>{format(new Date(legalCase.created_at), 'PPp')}</p>
            </div>
          </div>

          {legalCase.last_reminder_sent && (
            <div>
              <h3 className="font-medium">Last Reminder Sent</h3>
              <p>{format(new Date(legalCase.last_reminder_sent), 'PPp')}</p>
            </div>
          )}

          {legalCase.escalation_date && (
            <div>
              <h3 className="font-medium">Escalation Date</h3>
              <p>{format(new Date(legalCase.escalation_date), 'PPp')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}