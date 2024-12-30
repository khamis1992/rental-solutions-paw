import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CaseDetails } from "./case-details/CaseDetails";
import { CaseWorkflowManager } from "./workflow/CaseWorkflowManager";
import { CommunicationsList } from "./communications/CommunicationsList";

interface ViewLegalCaseDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewLegalCaseDialog = ({
  caseId,
  open,
  onOpenChange,
}: ViewLegalCaseDialogProps) => {
  const { data: legalCase, isLoading } = useQuery({
    queryKey: ["legal-case", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_cases")
        .select(`
          *,
          customer:profiles!legal_cases_customer_id_fkey (
            full_name,
            phone_number,
            email,
            address
          )
        `)
        .eq("id", caseId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Case Details</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <CaseDetails legalCase={legalCase} />
          </TabsContent>

          <TabsContent value="workflow">
            <CaseWorkflowManager
              caseId={caseId}
              currentStatus={legalCase?.status}
            />
          </TabsContent>

          <TabsContent value="communications">
            <CommunicationsList caseId={caseId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};