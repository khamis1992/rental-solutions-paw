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
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isValid, parse } from "date-fns";
import { calculateDuration, calculateContractValue } from "./utils/agreementCalculations";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [duration, setDuration] = useState(0);
  const [contractValue, setContractValue] = useState(0);

  // Initialize dates and calculate initial values when agreement loads
  useEffect(() => {
    if (agreement) {
      const start = agreement.start_date ? format(new Date(agreement.start_date), "yyyy-MM-dd") : "";
      const end = agreement.end_date ? format(new Date(agreement.end_date), "yyyy-MM-dd") : "";
      
      setStartDate(start);
      setEndDate(end);
      
      if (start && end) {
        const calculatedDuration = calculateDuration(start, end);
        setDuration(calculatedDuration);
        
        if (agreement.rent_amount) {
          const calculatedValue = calculateContractValue(Number(agreement.rent_amount), calculatedDuration);
          setContractValue(calculatedValue);
          console.log('Initial calculation:', {
            rentAmount: Number(agreement.rent_amount),
            duration: calculatedDuration,
            contractValue: calculatedValue
          });
        }
      }
    }
  }, [agreement]);

  const validateAndUpdateDates = async (start: string, end: string) => {
    if (!start || !end) return;

    const startDateObj = parse(start, "yyyy-MM-dd", new Date());
    const endDateObj = parse(end, "yyyy-MM-dd", new Date());

    if (!isValid(startDateObj)) {
      setDateError("Invalid start date");
      return;
    }

    if (!isValid(endDateObj)) {
      setDateError("Invalid end date");
      return;
    }

    if (startDateObj > endDateObj) {
      setDateError("Start date cannot be after end date");
      return;
    }

    setDateError("");

    // Calculate new duration and contract value
    const newDuration = calculateDuration(start, end);
    setDuration(newDuration);
    
    if (agreement?.rent_amount) {
      const rentAmount = Number(agreement.rent_amount);
      const newContractValue = calculateContractValue(rentAmount, newDuration);
      setContractValue(newContractValue);
      console.log('Updated values:', {
        rentAmount,
        duration: newDuration,
        contractValue: newContractValue
      });
    }

    try {
      const { error } = await supabase
        .from('leases')
        .update({
          start_date: start,
          end_date: end,
          agreement_duration: `${newDuration} months`
        })
        .eq('id', agreementId);

      if (error) throw error;
      toast.success("Dates updated successfully");
    } catch (error) {
      console.error('Error updating dates:', error);
      toast.error('Failed to update dates');
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
          <DialogTitle>Agreement Details</DialogTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    validateAndUpdateDates(e.target.value, endDate);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    validateAndUpdateDates(startDate, e.target.value);
                  }}
                />
              </div>
            </div>
            {dateError && (
              <div className="text-sm text-red-500">{dateError}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (Months)</Label>
                <Input
                  type="number"
                  value={duration}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label>Contract Value (QAR)</Label>
                <Input
                  type="number"
                  value={contractValue}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

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
