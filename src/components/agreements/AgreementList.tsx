import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AgreementList = () => {
  const navigate = useNavigate();
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [selectedPaymentTrackingId, setSelectedPaymentTrackingId] = useState<string | null>(null);
  const [selectedPaymentHistoryId, setSelectedPaymentHistoryId] = useState<string | null>(null);
  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPullingData, setIsPullingData] = useState(false);

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

  const handlePullData = async () => {
    try {
      setIsPullingData(true);
      
      // Fetch remaining amounts data
      const { data: remainingAmounts, error: remainingAmountsError } = await supabase
        .from('remaining_amounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (remainingAmountsError) {
        console.error('Error fetching remaining amounts:', remainingAmountsError);
        toast.error('Failed to fetch remaining amounts data');
        return;
      }

      if (!remainingAmounts || remainingAmounts.length === 0) {
        toast.info('No remaining amounts data found');
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const processedAgreements = new Set();

      // Process each remaining amount sequentially
      for (const amount of remainingAmounts) {
        // Skip if we've already processed this agreement
        if (processedAgreements.has(amount.agreement_number)) {
          continue;
        }

        try {
          let leaseId = amount.lease_id;

          if (!leaseId && amount.agreement_number) {
            // Try to find the lease by agreement number
            const { data: leaseData, error: leaseError } = await supabase
              .from('leases')
              .select('id')
              .eq('agreement_number', amount.agreement_number)
              .maybeSingle();

            if (leaseError) {
              console.error('Error finding lease:', leaseError);
              errorCount++;
              continue;
            }

            if (leaseData) {
              leaseId = leaseData.id;
            }
          }

          if (leaseId) {
            const updateResult = await supabase
              .from('leases')
              .update({
                agreement_duration: amount.agreement_duration,
                total_amount: amount.final_price,
                rent_amount: amount.rent_amount
              })
              .eq('id', leaseId)
              .select();

            if (updateResult.error) {
              console.error('Error updating agreement:', updateResult.error);
              errorCount++;
            } else {
              successCount++;
              processedAgreements.add(amount.agreement_number);
              console.log(`Successfully updated agreement ${amount.agreement_number}:`, {
                agreement_duration: amount.agreement_duration,
                total_amount: amount.final_price,
                rent_amount: amount.rent_amount,
                remaining_amount: amount.remaining_amount
              });
            }
          } else {
            console.error('No lease ID found for agreement:', amount.agreement_number);
            errorCount++;
          }
        } catch (error) {
          console.error('Error processing agreement:', amount.agreement_number, error);
          errorCount++;
        }
      }

      await refetch();
      
      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} agreements`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} agreements`);
      }
      if (successCount === 0 && errorCount === 0) {
        toast.info('No agreements to update');
      }

    } catch (error) {
      console.error('Error pulling data:', error);
      toast.error('Failed to pull data');
    } finally {
      setIsPullingData(false);
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
      <div className="flex justify-between items-center">
        <AgreementFilters
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onSortChange={setSortOrder}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handlePullData}
          disabled={isPullingData}
          className="ml-4"
        >
          <Download className="h-4 w-4 mr-2" />
          Pull Data
        </Button>
      </div>
      
      <AgreementListContent
        agreements={agreements}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onViewContract={handleViewContractClick}
        onPrintContract={handlePrintContract}
        onAgreementClick={setSelectedAgreementId}
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
    </div>
  );
};