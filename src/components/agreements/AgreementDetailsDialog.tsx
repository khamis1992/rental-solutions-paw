import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerInfoCard } from "./details/CustomerInfoCard";
import { VehicleInfoCard } from "./details/VehicleInfoCard";
import { RentManagement } from "./details/RentManagement";
import { DocumentUpload } from "./details/DocumentUpload";
import { DamageAssessment } from "./details/DamageAssessment";
import { TrafficFines } from "./details/TrafficFines";
import { PaymentHistory } from "./details/PaymentHistory";
import { useAgreementDetails } from "./hooks/useAgreementDetails";
import { LeaseStatus } from "@/types/agreement.types";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";

interface AgreementDetailsDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgreementDetailsDialog = ({
  agreementId,
  open,
  onOpenChange,
}: AgreementDetailsDialogProps) => {
  const { agreement, isLoading } = useAgreementDetails(agreementId, open);
  const queryClient = useQueryClient();

  const pullRemainingAmountData = async () => {
    try {
      if (!agreement?.agreement_number) {
        toast.error("Agreement number is required to pull data");
        return;
      }

      const { data: remainingAmount, error } = await supabase
        .from('remaining_amounts')
        .select('*')
        .eq('agreement_number', agreement.agreement_number)
        .maybeSingle();

      if (error) throw error;

      if (!remainingAmount) {
        toast.error("No remaining amount data found for this agreement");
        return;
      }

      // Update the agreement with the pulled data
      const { error: updateError } = await supabase
        .from('leases')
        .update({
          agreement_duration: remainingAmount.agreement_duration,
          total_amount: remainingAmount.final_price,
          rent_amount: remainingAmount.rent_amount
        })
        .eq('id', agreementId);

      if (updateError) throw updateError;

      // Invalidate the agreement query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['agreement-details', agreementId] });

      toast.success("Data successfully pulled and updated");
    } catch (error) {
      console.error('Error pulling data:', error);
      toast.error("Failed to pull data. Please try again.");
    }
  };

  if (!open) return null;

  const canEditAgreement = agreement?.status !== LeaseStatus.CLOSED && 
                          agreement?.status !== LeaseStatus.CANCELLED;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>Agreement Details</DialogTitle>
              <DialogDescription>
                View and manage agreement details, payments, and related information.
              </DialogDescription>
            </div>
            <Button 
              onClick={pullRemainingAmountData}
              variant="secondary"
              size="sm"
              className="transition-all hover:scale-105"
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Pull Data
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Information */}
            <CustomerInfoCard customer={agreement?.customer} />

            {/* Vehicle Information */}
            <VehicleInfoCard vehicle={agreement?.vehicle} />

            {/* Rent Management */}
            {canEditAgreement && (
              <RentManagement 
                agreement={agreement} 
                remainingAmount={agreement?.remainingAmount}
              />
            )}

            {/* Payment History */}
            <PaymentHistory 
              agreementId={agreementId} 
              canEdit={canEditAgreement}
            />

            {/* Document Upload */}
            <DocumentUpload 
              agreementId={agreementId}
              vehicleId={agreement?.vehicle_id}
            />

            {/* Damage Assessment */}
            <DamageAssessment 
              agreementId={agreementId}
              vehicleId={agreement?.vehicle_id}
            />

            {/* Traffic Fines */}
            <TrafficFines 
              agreementId={agreementId}
              vehicleId={agreement?.vehicle_id}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};