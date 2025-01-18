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
import { Download, Calculator, Upload } from "lucide-react";
import { usePullAgreementData } from "./hooks/usePullAgreementData";
import { AgreementPDFImport } from "./AgreementPDFImport";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateAgreementDialog } from "./CreateAgreementDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AgreementList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [selectedPaymentTrackingId, setSelectedPaymentTrackingId] = useState<string | null>(null);
  const [selectedPaymentHistoryId, setSelectedPaymentHistoryId] = useState<string | null>(null);
  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<string | null>(null);
  const [isHistoricalDeleteDialogOpen, setIsHistoricalDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCalculatingFines, setIsCalculatingFines] = useState(false);

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

  const { isPullingData, handlePullData } = usePullAgreementData(refetch);

  const handleViewContractClick = async (agreementId: string) => {
    const agreement = await handleViewContract(agreementId);
    if (agreement) {
      navigate(`/agreements/${agreementId}/view`);
    }
  };

  const calculateLateFines = async () => {
    if (isCalculatingFines) return;
    setIsCalculatingFines(true);

    try {
      // Get all agreements with their payments
      const { data: agreementsWithPayments, error: fetchError } = await supabase
        .from('leases')
        .select(`
          id,
          agreement_number,
          rent_due_day,
          unified_payments (
            id,
            payment_date,
            amount,
            late_fine_amount,
            status
          )
        `)
        .eq('status', 'active');

      if (fetchError) throw fetchError;

      let finesAdded = 0;
      
      // Process each agreement
      for (const agreement of agreementsWithPayments || []) {
        const payments = agreement.unified_payments || [];
        const dueDay = agreement.rent_due_day || 1;
        
        for (const payment of payments) {
          // Only process completed payments
          if (!payment.payment_date || payment.status !== 'completed') {
            continue;
          }

          const paymentDate = new Date(payment.payment_date);
          const paymentDay = paymentDate.getDate();
          
          // Calculate days late (if payment was made after the due day)
          const daysLate = Math.max(0, paymentDay - dueDay);

          if (daysLate > 0 && !payment.late_fine_amount) {
            const lateFineAmount = 120 * daysLate; // 120 QAR per day

            // Update payment with late fine
            const { error: updateError } = await supabase
              .from('unified_payments')
              .update({ 
                late_fine_amount: lateFineAmount,
                days_overdue: daysLate
              })
              .eq('id', payment.id);

            if (updateError) {
              console.error('Error updating late fine:', updateError);
              continue;
            }

            finesAdded++;
          }
        }
      }

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
      await refetch();

      if (finesAdded > 0) {
        toast.success(`Added late fines to ${finesAdded} payment(s)`);
      } else {
        toast.info('No new late fines to add');
      }
    } catch (error) {
      console.error('Error calculating late fines:', error);
      toast.error('Failed to calculate late fines');
    } finally {
      setIsCalculatingFines(false);
    }
  };

  const handleDeleteHistoricalPayments = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.functions.invoke('delete-historical-payments', {
        method: 'POST'
      });

      if (error) throw error;

      toast.success("All historical payments deleted successfully");
      await refetch();
    } catch (error) {
      console.error("Error deleting historical payments:", error);
      toast.error("Failed to delete historical payments");
    } finally {
      setIsDeleting(false);
      setIsHistoricalDeleteDialogOpen(false);
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
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Create Agreement
            </Button>
          </CreateAgreementDialog>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePullData}
            disabled={isPullingData}
            className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Pull Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={calculateLateFines}
            disabled={isCalculatingFines}
            className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isCalculatingFines ? 'Calculating...' : 'Add Fine'}
          </Button>
        </div>
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

      <AlertDialog open={isHistoricalDeleteDialogOpen} onOpenChange={setIsHistoricalDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Historical Payments</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all payments made before 2025 across all agreements. This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHistoricalPayments}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All Historical Payments"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};