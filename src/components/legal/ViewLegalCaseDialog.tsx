import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ViewLegalCaseDialogProps {
  caseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewLegalCaseDialog = ({
  caseId,
  open,
  onOpenChange,
}: ViewLegalCaseDialogProps) => {
  const { toast } = useToast();
  
  const { data: legalCase, isLoading, error } = useQuery({
    queryKey: ["legal-case", caseId],
    queryFn: async () => {
      if (!caseId) return null;

      const { data, error } = await supabase
        .from("legal_cases")
        .select(`
          *,
          customer:profiles(full_name),
          assigned_to_user:profiles(full_name)
        `)
        .eq("id", caseId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load legal case details: " + error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    enabled: !!caseId && open,
  });

  if (!open) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!legalCase) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legal Case Not Found</DialogTitle>
          </DialogHeader>
          <p>The requested legal case could not be found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legal Case Details</DialogTitle>
        </DialogHeader>
        <div>
          <h2>Case Type: {legalCase.case_type}</h2>
          <p>Customer: {legalCase.customer?.full_name}</p>
          <p>Assigned To: {legalCase.assigned_to_user?.full_name || 'Unassigned'}</p>
          <p>Status: {legalCase.status}</p>
          <p>Amount Owed: ${legalCase.amount_owed.toFixed(2)}</p>
          <p>Created Date: {new Date(legalCase.created_at).toLocaleDateString()}</p>
          <p>Details: {legalCase.details}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
