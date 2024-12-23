import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LegalCase, LegalCaseStatus } from "@/types/legal";

interface ViewLegalCaseDialogProps {
  caseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewLegalCaseDialog({
  caseId,
  open,
  onOpenChange,
}: ViewLegalCaseDialogProps) {
  const queryClient = useQueryClient();

  const { data: legalCase } = useQuery({
    queryKey: ["legal-case", caseId],
    queryFn: async () => {
      if (!caseId) return null;

      const { data, error } = await supabase
        .from("legal_cases")
        .select(`
          *,
          customer:profiles!legal_cases_customer_id_fkey(full_name),
          assigned_to_user:profiles!legal_cases_assigned_to_fkey(full_name)
        `)
        .eq("id", caseId)
        .single();

      if (error) throw error;
      return data as LegalCase;
    },
    enabled: !!caseId,
  });

  const updateStatus = async (newStatus: LegalCaseStatus) => {
    try {
      const { error } = await supabase
        .from("legal_cases")
        .update({ status: newStatus })
        .eq("id", caseId);

      if (error) throw error;

      toast.success("Case status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["legal-cases"] });
      queryClient.invalidateQueries({ queryKey: ["legal-case", caseId] });
    } catch (error) {
      console.error("Error updating case status:", error);
      toast.error("Failed to update case status");
    }
  };

  if (!legalCase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Legal Case Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm">Customer</h4>
              <p>{legalCase.customer.full_name}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Case Type</h4>
              <p>{legalCase.case_type}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Amount Owed</h4>
              <p>${legalCase.amount_owed.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Created Date</h4>
              <p>{format(new Date(legalCase.created_at), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Status</h4>
              <Badge variant={
                legalCase.status === 'resolved' ? 'default' :
                legalCase.status === 'escalated' ? 'destructive' :
                'secondary'
              }>
                {legalCase.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium text-sm">Assigned To</h4>
              <p>{legalCase.assigned_to_user?.full_name || 'Unassigned'}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Description</h4>
            <p className="text-sm">{legalCase.description}</p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Update Status</h4>
            <div className="flex gap-4">
              <Select
                onValueChange={updateStatus}
                defaultValue={legalCase.status}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_reminder">Pending Reminder</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}