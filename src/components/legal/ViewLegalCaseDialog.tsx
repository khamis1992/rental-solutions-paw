import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CaseWorkflowManager } from "./workflow/CaseWorkflowManager";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

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
  const queryClient = useQueryClient();

  const { data: caseDetails, isLoading } = useQuery({
    queryKey: ["legal-case", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from("legal_cases")
        .select(`
          *,
          customer:profiles (
            full_name,
            phone_number,
            email
          )
        `)
        .eq("id", caseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!caseId && open,
  });

  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ["legal-case", caseId] });
    queryClient.invalidateQueries({ queryKey: ["legal-cases"] });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Case Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : caseDetails ? (
          <ScrollArea className="flex-1">
            <div className="space-y-6 p-6">
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold">Customer Information</h3>
                  <div className="mt-2 space-y-2">
                    <p>Name: {caseDetails.customer?.full_name}</p>
                    <p>Phone: {caseDetails.customer?.phone_number}</p>
                    <p>Email: {caseDetails.customer?.email}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Case Information</h3>
                  <div className="mt-2 space-y-2">
                    <p>Case Type: {caseDetails.case_type}</p>
                    <p>Amount Owed: ${caseDetails.amount_owed}</p>
                    <p>Priority: {caseDetails.priority}</p>
                    <p>Description: {caseDetails.description}</p>
                  </div>
                </div>

                <CaseWorkflowManager
                  caseId={caseDetails.id}
                  currentStatus={caseDetails.status}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Case not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};