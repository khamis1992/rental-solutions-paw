import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { InvoiceDialog } from "./InvoiceDialog";
import { PaymentTrackingDialog } from "./PaymentTrackingDialog";
import { PaymentHistoryDialog } from "./PaymentHistoryDialog";
import { AgreementDetailsDialog } from "./AgreementDetailsDialog";
import { DeleteAgreementDialog } from "./DeleteAgreementDialog";
import { AgreementFilters } from "./AgreementFilters";
import { AgreementListHeader } from "./list/AgreementListHeader";
import { AgreementListContent } from "./list/AgreementListContent";
import { useAgreementList } from "./list/useAgreementList";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { AgreementPDFImport } from "./AgreementPDFImport";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateAgreementDialog } from "./CreateAgreementDialog";
import { TemplatePreview } from "./templates/TemplatePreview";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export const AgreementList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [selectedPaymentTrackingId, setSelectedPaymentTrackingId] = useState<string | null>(null);
  const [selectedPaymentHistoryId, setSelectedPaymentHistoryId] = useState<string | null>(null);
  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<string | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const {
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    agreements,
    totalPages,
    isLoading,
    error,
    handleViewContract,
    handlePrintContract,
    refetch,
  } = useAgreementList();

  const handleViewContractClick = async (agreementId: string) => {
    const agreement = await handleViewContract(agreementId);
    if (agreement) {
      navigate(`/agreements/${agreementId}/view`);
    }
  };

  const handleAgreementClick = async (agreementId: string) => {
    try {
      // Get the agreement template content using the template_id relationship
      const { data: agreement, error: agreementError } = await supabase
        .from('leases')
        .select(`
          *,
          agreement_templates!leases_template_id_fkey (
            content
          )
        `)
        .eq('id', agreementId)
        .maybeSingle();

      if (agreementError) throw agreementError;

      if (!agreement?.agreement_templates?.content) {
        toast.error('No template found for this agreement');
        return;
      }

      setSelectedTemplate(agreement.agreement_templates.content);
      setShowTemplatePreview(true);
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load agreement template');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading agreements...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading agreements: {error.message}</div>;
  }

  if (!agreements || agreements.length === 0) {
    return <div className="text-center py-4">No agreements found. Try importing some agreements first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <AgreementFilters
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onSortChange={setSortOrder}
        />
        <div className="flex flex-wrap items-center gap-3">
          <AgreementPDFImport />
          <CreateAgreementDialog>
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Create Agreement
            </Button>
          </CreateAgreementDialog>
        </div>
      </div>
      
      <AgreementListContent
        agreements={agreements}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onViewContract={handleViewContractClick}
        onPrintContract={handlePrintContract}
        onAgreementClick={handleAgreementClick}
        onNameClick={setSelectedDetailsId}
        onDeleteClick={setAgreementToDelete}
        onDeleted={refetch}
      />
      
      <InvoiceDialog
        agreementId={selectedAgreementId || ""}
        open={!!selectedAgreementId}
        onOpenChange={(open) => !open && setSelectedAgreementId(null)}
      />

      <PaymentTrackingDialog
        agreementId={selectedPaymentTrackingId || ""}
        open={!!selectedPaymentTrackingId}
        onOpenChange={(open) => !open && setSelectedPaymentTrackingId(null)}
      />

      <PaymentHistoryDialog
        agreementId={selectedPaymentHistoryId || ""}
        open={!!selectedPaymentHistoryId}
        onOpenChange={(open) => !open && setSelectedPaymentHistoryId(null)}
      />

      <AgreementDetailsDialog
        agreementId={selectedDetailsId || ""}
        open={!!selectedDetailsId}
        onOpenChange={(open) => !open && setSelectedDetailsId(null)}
      />

      <DeleteAgreementDialog
        agreementId={agreementToDelete || ""}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDeleted={refetch}
      />

      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className="max-w-4xl">
          <TemplatePreview 
            content={selectedTemplate}
            missingVariables={[]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};