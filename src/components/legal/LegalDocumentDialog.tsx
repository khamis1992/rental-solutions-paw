import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface LegalDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
}

export function LegalDocumentDialog({
  open,
  onOpenChange,
  customerId,
}: LegalDocumentDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");

  const { data: customerData } = useQuery({
    queryKey: ["customer-legal-data", customerId],
    queryFn: async () => {
      const { data: leases, error: leasesError } = await supabase
        .from("leases")
        .select(`
          *,
          penalties (
            amount,
            type,
            status
          )
        `)
        .eq("customer_id", customerId);

      if (leasesError) throw leasesError;

      const pendingPenalties = leases
        .flatMap((lease) => lease.penalties)
        .filter((penalty) => penalty.status === "pending");

      return {
        leases,
        pendingPenalties,
      };
    },
    enabled: !!customerId,
  });

  const { data: templates } = useQuery({
    queryKey: ["legal-document-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_document_templates")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  const handleGenerateDocument = async () => {
    try {
      const template = templates?.find((t) => t.id === selectedTemplate);
      if (!template) return;

      let content = template.content;

      // Replace variables in template
      if (customerData) {
        const totalPendingAmount = customerData.pendingPenalties.reduce(
          (sum, penalty) => sum + penalty.amount,
          0
        );

        content = content
          .replace(/\{total_pending_amount\}/g, totalPendingAmount.toString())
          .replace(
            /\{pending_penalties_count\}/g,
            customerData.pendingPenalties.length.toString()
          );
      }

      setGeneratedContent(content);
      toast.success("Document generated successfully");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Legal Document</DialogTitle>
          <DialogDescription>
            Select a template and generate a legal document based on customer data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Template</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">Select a template...</option>
              {templates?.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleGenerateDocument}
            disabled={!selectedTemplate}
            className="w-full"
          >
            Generate Document
          </Button>

          {generatedContent && (
            <div className="space-y-2">
              <Label>Generated Document</Label>
              <Textarea
                value={generatedContent}
                readOnly
                className="min-h-[200px]"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};