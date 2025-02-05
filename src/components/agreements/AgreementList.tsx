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
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
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
      console.log('Fetching agreement details for:', agreementId);
      
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
          ),
          remaining_amounts!remaining_amounts_lease_id_fkey (
            remaining_amount
          )
        `)
        .eq('id', agreementId)
        .maybeSingle();

      if (agreementError) {
        console.error('Error fetching agreement:', agreementError);
        throw agreementError;
      }

      if (!agreement?.agreement_templates?.content) {
        console.error('No template found for agreement:', agreementId);
        toast.error('No template found for this agreement');
        return;
      }

      console.log('Agreement data:', agreement);
      console.log('Template content before replacement:', agreement.agreement_templates.content);

      let templateContent = agreement.agreement_templates.content;

      // Replace agreement variables
      const agreementReplacements = {
        'agreement.start_date': formatDateToDisplay(agreement.start_date),
        'agreement.end_date': formatDateToDisplay(agreement.end_date),
        'agreement.agreement_number': agreement.agreement_number || '',
        'agreement.rent_amount': `${agreement.rent_amount} QAR`,
        'agreement.daily_late_fee': `${agreement.daily_late_fee} QAR`,
        'agreement.agreement_duration': agreement.agreement_duration || '',
        'agreement.total_amount': `${agreement.total_amount} QAR`,
        'agreement.down_payment': agreement.down_payment ? `${agreement.down_payment} QAR` : '0 QAR',
        'payment.down_payment': agreement.down_payment ? `${agreement.down_payment} QAR` : '0 QAR'
      };

      // Replace customer variables
      const customerReplacements = {
        'customer.name': agreement.customer?.full_name || '',
        'customer.full_name': agreement.customer?.full_name || '',
        'customer.phone_number': agreement.customer?.phone_number || '',
        'customer.email': agreement.customer?.email || '',
        'customer.address': agreement.customer?.address || '',
        'customer.nationality': agreement.customer?.nationality || '',
        'customer.driver_license': agreement.customer?.driver_license || ''
      };

      // Replace vehicle variables
      const vehicleReplacements = {
        'vehicle.name': `${agreement.vehicle?.make} ${agreement.vehicle?.model}`,
        'vehicle.make': agreement.vehicle?.make || '',
        'vehicle.model': agreement.vehicle?.model || '',
        'vehicle.year': agreement.vehicle?.year?.toString() || '',
        'vehicle.color': agreement.vehicle?.color || '',
        'vehicle.license_plate': agreement.vehicle?.license_plate || '',
        'vehicle.vin': agreement.vehicle?.vin || ''
      };

      // Combine all replacements
      const allReplacements = {
        ...agreementReplacements,
        ...customerReplacements,
        ...vehicleReplacements
      };

      // Perform all replacements
      Object.entries(allReplacements).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        templateContent = templateContent.replace(regex, value);
      });

      console.log('Template content after replacement:', templateContent);
      
      setSelectedTemplate(templateContent);
      setShowTemplatePreview(true);
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load agreement template');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AgreementFilters
          onStatusChange={setStatusFilter}
          onSortChange={setSortOrder}
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
        <div className="text-center py-4">Loading agreements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AgreementFilters
          onStatusChange={setStatusFilter}
          onSortChange={setSortOrder}
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
        <div className="text-center py-4 text-red-500">Error loading agreements: {error.message}</div>
      </div>
    );
  }

  if (!agreements || agreements.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <AgreementFilters
            onStatusChange={setStatusFilter}
            onSortChange={setSortOrder}
            onSearch={setSearchQuery}
            searchValue={searchQuery}
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
        <div className="text-center py-4">
          {searchQuery ? (
            <div className="space-y-2">
              <p>No agreements found matching your search.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            "No agreements found. Try importing some agreements first."
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <AgreementFilters
          onStatusChange={setStatusFilter}
          onSortChange={setSortOrder}
          onSearch={setSearchQuery}
          searchValue={searchQuery}
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
