import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PaymentAIRecommendations } from "./PaymentAIRecommendations";
import { Loader2 } from "lucide-react";

interface SinglePaymentFormProps {
  contractId: string;
  onSuccess: () => void;
}

export function SinglePaymentForm({ contractId, onSuccess }: SinglePaymentFormProps) {
  const [firstChequeNumber, setFirstChequeNumber] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [draweeBankName, setDraweeBankName] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const analyzePayment = async () => {
    if (!firstChequeNumber || !firstPaymentDate || !amount) {
      toast.error("Please fill in all fields first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data: suggestions, error } = await supabase.functions.invoke(
        "analyze-payment-installment",
        {
          body: {
            firstChequeNumber,
            amount: Number(amount),
            firstPaymentDate,
            totalInstallments: 1
          }
        }
      );

      if (error) throw error;
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error analyzing payment:', error);
      toast.error("Failed to analyze payment details");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!firstChequeNumber || !firstPaymentDate || !amount || !draweeBankName) {
        throw new Error("Please fill in all required fields");
      }

      const { error } = await supabase
        .from("car_installment_payments")
        .insert({
          contract_id: contractId,
          cheque_number: firstChequeNumber,
          amount: Number(amount),
          payment_date: firstPaymentDate,
          drawee_bank: draweeBankName,
          paid_amount: 0,
          remaining_amount: Number(amount),
          status: "pending"
        });

      if (error) throw error;

      toast.success("Payment installment added successfully");
      onSuccess();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment installment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chequeNumber">Cheque Number</Label>
        <Input 
          id="chequeNumber" 
          value={firstChequeNumber}
          onChange={(e) => setFirstChequeNumber(e.target.value)}
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (QAR)</Label>
        <Input 
          id="amount" 
          type="number" 
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Input 
          id="paymentDate" 
          type="date"
          value={firstPaymentDate}
          onChange={(e) => setFirstPaymentDate(e.target.value)}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="draweeBankName">Drawee Bank Name</Label>
        <Input 
          id="draweeBankName" 
          value={draweeBankName}
          onChange={(e) => setDraweeBankName(e.target.value)}
          required 
        />
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
            Adding Payment...
          </>
        ) : (
          'Add Payment'
        )}
      </Button>
    </form>
  );
}