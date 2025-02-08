
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
import { 
  Receipt, 
  FileText, 
  Upload, 
  AlertTriangle, 
  Clock, 
  CalendarCheck, 
  Calculator,
  History,
  Car,
  UserCircle,
  CreditCard,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const handleStatusChange = () => {
    refetch();
  };

  if (!open) return null;

  // Get the remaining amount from the view
  const remainingAmount = agreement?.remainingAmount?.[0]?.remaining_amount ?? 0;

  const mappedAgreement = agreement ? {
    id: agreement.id,
    agreement_number: agreement.agreement_number || '',
    status: agreement.status as LeaseStatus,
    start_date: agreement.start_date || '',
    end_date: agreement.end_date || '',
    rent_amount: rentAmount,
    contractValue: contractValue,
    remainingAmount: remainingAmount
  } : undefined;

  const getStatusColor = (status: LeaseStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending_payment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Agreement Details
          </DialogTitle>
          <DialogDescription>
            View and manage agreement details, payments, and related information.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Clock className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading agreement details...</span>
          </div>
        ) : agreement ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <AgreementHeader 
                agreement={mappedAgreement}
                remainingAmount={remainingAmount}
              />
              <div className="flex flex-col items-end gap-2">
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(agreement.status as LeaseStatus)} px-4 py-2 text-sm flex items-center gap-2`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {agreement.status}
                </Badge>
                <AgreementStatusSelect
                  agreementId={agreement.id}
                  currentStatus={agreement.status as LeaseStatus}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <CalendarCheck className="h-5 w-5" />
                    Agreement Duration
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
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <Calculator className="h-5 w-5" />
                    Financial Details
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rent_amount">Rent Amount (QAR)</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="rent_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={rentAmount}
                          onChange={(e) => handleRentAmountChange(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (Months)</Label>
                      <Input
                        type="number"
                        value={duration}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Label>Contract Value (QAR)</Label>
                    <Input
                      type="number"
                      value={contractValue}
                      disabled
                      className="bg-muted mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <CustomerInfoCard customer={agreement.customer} />
              <VehicleInfoCard 
                vehicle={agreement.vehicle}
                initialMileage={agreement.initial_mileage}
              />
            </div>

            <Tabs defaultValue="payments" className="w-full">
              <TabsList className="grid grid-cols-6 gap-4 w-full">
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="payment-history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="invoices" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="damages" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Damages
                </TabsTrigger>
                <TabsTrigger value="fines" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Fines
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="payments" className="mt-6">
                <PaymentForm agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="payment-history" className="mt-6">
                <PaymentHistory agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="invoices" className="mt-6">
                <InvoiceList agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="documents" className="mt-6">
                <DocumentUpload agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="damages" className="mt-6">
                <DamageAssessment agreementId={agreementId} />
              </TabsContent>
              <TabsContent value="fines" className="mt-6">
                <TrafficFines agreementId={agreementId} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            Agreement not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
