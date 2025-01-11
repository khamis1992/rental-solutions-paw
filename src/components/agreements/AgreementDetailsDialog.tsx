import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "./details/PaymentForm";
import { InvoiceList } from "./details/InvoiceList";
import { DocumentUpload } from "./details/DocumentUpload";
import { DamageAssessment } from "./details/DamageAssessment";
import { TrafficFines } from "./details/TrafficFines";
import { AgreementHeader } from "./AgreementHeader";
import { CustomerInfoCard } from "./details/CustomerInfoCard";
import { VehicleInfoCard } from "./details/VehicleInfoCard";
import { PaymentHistory } from "./details/PaymentHistory";
import { useAgreementDetails } from "./hooks/useAgreementDetails";
import { LeaseStatus } from "@/types/agreement.types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { calculateDuration, calculateContractValue } from "./utils/agreementCalculations";
import { AgreementStatusSelect } from "./details/AgreementStatusSelect";
import { formatDateToDisplay, parseDateFromDisplay, formatDateForApi } from "@/lib/dateUtils";

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
  const { agreement, isLoading, refetch } = useAgreementDetails(agreementId, open);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(0);
  const [contractValue, setContractValue] = useState(0);
  const [rentAmount, setRentAmount] = useState<number>(0);

  // Initialize dates, rent amount and calculate initial values when agreement loads
  useEffect(() => {
    if (agreement) {
      const start = agreement.start_date ? formatDateToDisplay(new Date(agreement.start_date)) : "";
      const end = agreement.end_date ? formatDateToDisplay(new Date(agreement.end_date)) : "";
      
      setStartDate(start);
      setEndDate(end);
      setRentAmount(Number(agreement.rent_amount) || 0);
      
      if (start && end) {
        const calculatedDuration = calculateDuration(start, end);
        setDuration(calculatedDuration);
        
        if (agreement.rent_amount) {
          const rentAmountValue = Number(agreement.rent_amount);
          const calculatedValue = calculateContractValue(rentAmountValue, calculatedDuration);
          setContractValue(calculatedValue);
        }
      }
    }
  }, [agreement]);

  const handleDateChange = async (start: string, end: string) => {
    if (!start || !end) return;

    const startDateObj = parseDateFromDisplay(start);
    const endDateObj = parseDateFromDisplay(end);

    if (!startDateObj || !endDateObj) {
      toast.error("Invalid date format. Please use DD/MM/YYYY");
      return;
    }

    if (startDateObj > endDateObj) {
      toast.error("Start date cannot be after end date");
      return;
    }

    // Calculate new duration and contract value
    const newDuration = calculateDuration(start, end);
    setDuration(newDuration);
    
    const newContractValue = calculateContractValue(rentAmount, newDuration);
    setContractValue(newContractValue);

    try {
      const { error } = await supabase
        .from('leases')
        .update({
          start_date: formatDateForApi(startDateObj),
          end_date: formatDateForApi(endDateObj),
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

  const handleRentAmountChange = async (value: string) => {
    const newRentAmount = Number(value);
    
    if (isNaN(newRentAmount) || newRentAmount < 0) {
      toast.error("Please enter a valid rent amount");
      return;
    }

    setRentAmount(newRentAmount);
    const newContractValue = calculateContractValue(newRentAmount, duration);
    setContractValue(newContractValue);

    try {
      const { error } = await supabase
        .from('leases')
        .update({
          rent_amount: newRentAmount
        })
        .eq('id', agreementId);

      if (error) throw error;
      toast.success("Rent amount updated successfully");
      refetch();
    } catch (error) {
      console.error('Error updating rent amount:', error);
      toast.error('Failed to update rent amount');
    }
  };

  const handleStatusChange = (newStatus: LeaseStatus) => {
    refetch();
  };

  if (!open) return null;

  const mappedAgreement = agreement ? {
    id: agreement.id,
    agreement_number: agreement.agreement_number || '',
    status: agreement.status as LeaseStatus,
    start_date: agreement.start_date || '',
    end_date: agreement.end_date || '',
    rent_amount: rentAmount,
    contractValue: contractValue
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
            <div className="flex justify-between items-start">
              <AgreementHeader 
                agreement={mappedAgreement}
                remainingAmount={agreement.remainingAmount}
              />
              <AgreementStatusSelect
                agreementId={agreement.id}
                currentStatus={agreement.status as LeaseStatus}
                onStatusChange={handleStatusChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DateInput
                label="Start Date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  handleDateChange(e.target.value, endDate);
                }}
              />
              <DateInput
                label="End Date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  handleDateChange(startDate, e.target.value);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent_amount">Rent Amount (QAR)</Label>
                <Input
                  id="rent_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={rentAmount}
                  onChange={(e) => handleRentAmountChange(e.target.value)}
                  className="bg-white"
                />
              </div>
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
            </Tabs>
          </div>
        ) : (
          <div>Agreement not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
