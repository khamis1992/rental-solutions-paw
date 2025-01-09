import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "./details/PaymentForm";
import { InvoiceList } from "./details/InvoiceList";
import { DocumentUpload } from "./details/DocumentUpload";
import { DamageAssessment } from "./details/DamageAssessment";
import { TrafficFines } from "./details/TrafficFines";
import { RentManagement } from "./details/RentManagement";
import { AgreementHeader } from "./AgreementHeader";
import { CustomerInfoCard } from "./details/CustomerInfoCard";
import { VehicleInfoCard } from "./details/VehicleInfoCard";
import { PaymentHistory } from "./details/PaymentHistory";
import { useAgreementDetails } from "./hooks/useAgreementDetails";
import { LeaseStatus } from "@/types/agreement.types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const handlePullData = async () => {
    try {
      toast.info("Fetching remaining amounts data...");
      
      // Fetch data from remaining_amounts table
      const { data: remainingData, error: remainingError } = await supabase
        .from('remaining_amounts')
        .select('*')
        .eq('lease_id', agreementId)
        .maybeSingle();

      if (remainingError) throw remainingError;

      if (!remainingData) {
        toast.warning("No remaining amounts data found for this agreement");
        return;
      }

      // Update the lease with the fetched data
      const { error: updateError } = await supabase
        .from('leases')
        .update({
          agreement_duration: remainingData.agreement_duration,
          total_amount: remainingData.final_price,
          rent_amount: remainingData.rent_amount
        })
        .eq('id', agreementId);

      if (updateError) throw updateError;

      toast.success("Agreement data updated successfully");
    } catch (error) {
      console.error('Error pulling data:', error);
      toast.error("Failed to update agreement data");
    }
  };

  if (!open) return null;

  const mappedAgreement = agreement ? {
    id: agreement.id,
    agreement_number: agreement.agreement_number || '',
    status: agreement.status as LeaseStatus,
    start_date: agreement.start_date || '',
    end_date: agreement.end_date || '',
    rent_amount: agreement.rent_amount || 0
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Agreement Details</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePullData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Pull Data
            </Button>
          </div>
          <DialogDescription>
            View and manage agreement details, payments, and related information.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div>Loading agreement details...</div>
        ) : agreement ? (
          <div className="space-y-6">
            <AgreementHeader 
              agreement={mappedAgreement}
              remainingAmount={agreement.remainingAmount}
              onCreate={() => {}}
              onImport={() => {}}
            />
            
            <CustomerInfoCard customer={agreement.customer} />
            
            <VehicleInfoCard 
              vehicle={agreement.vehicle}
              initialMileage={agreement.initial_mileage}
            />

            <Tabs defaultValue="payments" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="payment-history">Payment History</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="damages">Damages</TabsTrigger>
                <TabsTrigger value="fines">Traffic Fines</TabsTrigger>
                {agreement.status === 'active' && (
                  <TabsTrigger value="rent">Rent Management</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="payments">
                <PaymentForm agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="payment-history">
                <PaymentHistory agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="invoices">
                <InvoiceList agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="documents">
                <DocumentUpload agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="damages">
                <DamageAssessment agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="fines">
                <TrafficFines agreementId={agreementId} />
              </TabsContent>
              {agreement.status === 'active' && (
                <TabsContent value="rent">
                  <RentManagement 
                    agreementId={agreementId}
                    initialRentAmount={agreement.rent_amount}
                    initialRentDueDay={agreement.rent_due_day}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        ) : (
          <div>Agreement not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};