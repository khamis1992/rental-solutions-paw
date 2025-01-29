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
import { formatDateToDisplay } from "@/lib/dateUtils";
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
      const { data: agreement, error: agreementError } = await supabase
        .from('leases')
        .select(`
          *,
          agreement_templates!leases_template_id_fkey (
            content
          ),
          customer:customer_id (
            full_name,
            phone_number,
            email,
            address,
            nationality,
            driver_license
          ),
          vehicle:vehicle_id (
            make,
            model,
            year,
            color,
            license_plate,
            vin
          )
        `)
        .eq('id', agreementId)
        .maybeSingle();

      if (agreementError) throw agreementError;

      if (!agreement?.agreement_templates?.content) {
        toast.error('No template found for this agreement');
        return;
      }

      let templateContent = agreement.agreement_templates.content;

      // Replace agreement variables
      templateContent = templateContent
        .replace(/{{agreement\.start_date}}/g, formatDateToDisplay(agreement.start_date))
        .replace(/{{agreement\.end_date}}/g, formatDateToDisplay(agreement.end_date))
        .replace(/{{agreement\.agreement_number}}/g, agreement.agreement_number || '')
        .replace(/{{agreement\.rent_amount}}/g, `${agreement.rent_amount} QAR`)
        .replace(/{{agreement\.daily_late_fee}}/g, `${agreement.daily_late_fee} QAR`)
        .replace(/{{agreement\.agreement_duration}}/g, agreement.agreement_duration || '')
        .replace(/{{agreement\.total_amount}}/g, `${agreement.total_amount} QAR`)
        .replace(/{{agreement\.down_payment}}/g, agreement.down_payment ? `${agreement.down_payment} QAR` : '0 QAR')
        .replace(/{{payment\.down_payment}}/g, agreement.down_payment ? `${agreement.down_payment} QAR` : '0 QAR');

      // Replace customer variables
      if (agreement.customer) {
        templateContent = templateContent
          .replace(/{{customer\.name}}/g, agreement.customer.full_name || '')
          .replace(/{{customer\.full_name}}/g, agreement.customer.full_name || '')
          .replace(/{{customer\.phone_number}}/g, agreement.customer.phone_number || '')
          .replace(/{{customer\.email}}/g, agreement.customer.email || '')
          .replace(/{{customer\.address}}/g, agreement.customer.address || '')
          .replace(/{{customer\.nationality}}/g, agreement.customer.nationality || '')
          .replace(/{{customer\.driver_license}}/g, agreement.customer.driver_license || '');
      }

      // Replace vehicle variables
      if (agreement.vehicle) {
        const vehicleName = `${agreement.vehicle.make} ${agreement.vehicle.model}`;
        templateContent = templateContent
          .replace(/{{vehicle\.name}}/g, vehicleName)
          .replace(/{{vehicle\.make}}/g, agreement.vehicle.make || '')
          .replace(/{{vehicle\.model}}/g, agreement.vehicle.model || '')
          .replace(/{{vehicle\.year}}/g, agreement.vehicle.year?.toString() || '')
          .replace(/{{vehicle\.color}}/g, agreement.vehicle.color || '')
          .replace(/{{vehicle\.license_plate}}/g, agreement.vehicle.license_plate || '')
          .replace(/{{vehicle\.vin}}/g, agreement.vehicle.vin || '');
      }

      setSelectedTemplate(templateContent);
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