import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addMonths, format } from "date-fns";
import { getAIPaymentSuggestions } from "../utils/paymentAI";
import { PaymentAIRecommendations } from "./PaymentAIRecommendations";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  onSuccess?: () => void;
  totalInstallments: number;
}

export function AddPaymentDialog({ 
  open, 
  onOpenChange, 
  contractId,
  onSuccess,
  totalInstallments
}: AddPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstChequeNumber, setFirstChequeNumber] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateChequeSequence = (baseNumber: string, startDate: string, amount: number) => {
    const sequence = [];
    const baseDigits = baseNumber.replace(/\D/g, '');
    const basePrefix = baseNumber.replace(/\d/g, '');
    
    for (let i = 0; i < totalInstallments; i++) {
      const nextNumber = String(Number(baseDigits) + i).padStart(baseDigits.length, '0');
      const paymentDate = addMonths(new Date(startDate), i);
      
      sequence.push({
        cheque_number: `${basePrefix}${nextNumber}`,
        payment_date: format(paymentDate, 'yyyy-MM-dd'),
      });
    }
    return sequence;
  };

  const analyzePayment = async () => {
    if (!firstChequeNumber || !firstPaymentDate || !amount) {
      toast.error("Please fill in all fields first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const suggestions = await getAIPaymentSuggestions(
        firstChequeNumber,
        Number(amount),
        firstPaymentDate,
        totalInstallments
      );
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error analyzing payment:', error);
      toast.error("Failed to analyze payment details");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!firstChequeNumber || !firstPaymentDate || !amount) {
        throw new Error("Please enter both cheque number and payment date");
      }

      const chequeSequence = generateChequeSequence(
        firstChequeNumber,
        firstPaymentDate,
        Number(amount)
      );

      let successCount = 0;
      let errorCount = 0;

      for (const cheque of chequeSequence) {
        try {
          const { data: existingCheque, error: checkError } = await supabase
            .from("car_installment_payments")
            .select("id")
            .eq("cheque_number", cheque.cheque_number)
            .maybeSingle();

          if (checkError) {
            console.error("Error checking cheque:", checkError);
            errorCount++;
            continue;
          }

          if (existingCheque) {
            console.warn(`Skipping duplicate cheque number: ${cheque.cheque_number}`);
            errorCount++;
            continue;
          }

          const { error: insertError } = await supabase
            .from("car_installment_payments")
            .insert({
              contract_id: contractId,
              cheque_number: cheque.cheque_number,
              amount: Number(amount),
              payment_date: cheque.payment_date,
              drawee_bank: e.currentTarget.draweeBankName.value,
              paid_amount: 0,
              remaining_amount: Number(amount),
              status: "pending"
            });

          if (insertError) {
            console.error("Error inserting payment:", insertError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error("Error processing cheque:", error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} payment installments`);
        if (errorCount > 0) {
          toast.warning(`${errorCount} installments could not be added (duplicate cheque numbers)`);
        }
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error("Failed to add any payment installments");
      }
    } catch (error: any) {
      console.error("Error adding payments:", error);
      toast.error(error.message || "Failed to add payment installments");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add Payment Installment</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chequeNumber">First Cheque Number</Label>
              <Input 
                id="chequeNumber" 
                name="chequeNumber" 
                value={firstChequeNumber}
                onChange={(e) => setFirstChequeNumber(e.target.value)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount per Installment (QAR)</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">First Payment Date</Label>
              <Input 
                id="paymentDate" 
                name="paymentDate" 
                type="date"
                value={firstPaymentDate}
                onChange={(e) => setFirstPaymentDate(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="draweeBankName">Drawee Bank Name</Label>
              <Input id="draweeBankName" name="draweeBankName" required />
            </div>

            {!aiSuggestions && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={analyzePayment}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Payment Details'
                )}
              </Button>
            )}

            {aiSuggestions && (
              <PaymentAIRecommendations
                riskLevel={aiSuggestions.riskAssessment.riskLevel}
                factors={aiSuggestions.riskAssessment.factors}
                recommendations={aiSuggestions.recommendations}
              />
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Payments...
                </>
              ) : (
                'Add Payment Sequence'
              )}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}