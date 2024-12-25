import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LegalCase, LegalCaseStatus } from "@/types/legal";

interface ViewLegalCaseDialogProps {
  legalCaseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewLegalCaseDialog = ({ legalCaseId, open, onOpenChange }: ViewLegalCaseDialogProps) => {
  const [legalCase, setLegalCase] = useState<LegalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LegalCaseStatus>("pending_reminder");

  useEffect(() => {
    const fetchLegalCase = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("legal_cases")
          .select(`
            *,
            customer:profiles!legal_cases_customer_id_fkey (
              full_name
            ),
            assigned_to_user:profiles!legal_cases_assigned_to_fkey (
              full_name
            )
          `)
          .eq("id", legalCaseId)
          .single();

        if (error) throw error;

        const legalCaseData = data as LegalCase;
        setLegalCase(legalCaseData);
        setStatus(legalCaseData.status);
      } catch (error) {
        console.error("Error fetching legal case:", error);
        setError("Failed to load legal case.");
      } finally {
        setLoading(false);
      }
    };

    if (open && legalCaseId) {
      fetchLegalCase();
    }
  }, [legalCaseId, open]);

  const handleStatusChange = async (newStatus: LegalCaseStatus) => {
    try {
      const { error } = await supabase
        .from("legal_cases")
        .update({ status: newStatus })
        .eq("id", legalCaseId);

      if (error) throw error;

      setStatus(newStatus);
      toast.success("Legal case status updated successfully.");
    } catch (error) {
      console.error("Error updating legal case status:", error);
      toast.error("Failed to update legal case status.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legal Case Details</DialogTitle>
        </DialogHeader>
        {legalCase && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <h3 className="font-semibold">Case Type: {legalCase.case_type}</h3>
              <p>Status: {status}</p>
              <p>Amount Owed: ${legalCase.amount_owed.toFixed(2)}</p>
              <p>Description: {legalCase.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange("in_legal_process")}
                disabled={status === "in_legal_process"}
              >
                Set to In Legal Process
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange("resolved")}
                disabled={status === "resolved"}
              >
                Set to Resolved
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange("escalated")}
                disabled={status === "escalated"}
              >
                Set to Escalated
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange("pending_reminder")}
                disabled={status === "pending_reminder"}
              >
                Set to Pending Reminder
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};