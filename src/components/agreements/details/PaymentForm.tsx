
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  agreementId: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lateFee, setLateFee] = useState(0);
  const [rentAmount, setRentAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Fetch rent amount and calculate late fee
  useEffect(() => {
    const fetchRentAmount = async () => {
      const { data: lease } = await supabase
        .from('leases')
        .select('rent_amount')
        .eq('id', agreementId)
        .maybeSingle();
      
      if (lease?.rent_amount) {
        setRentAmount(Number(lease.rent_amount));
      }
    };

    const calculateLateFee = () => {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      if (today > firstOfMonth) {
        const daysLate = Math.floor((today.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24));
        setLateFee(daysLate * 120); // 120 QAR per day
      } else {
        setLateFee(0);
      }
    };

    fetchRentAmount();
    calculateLateFee();
  }, [agreementId]);

  // Update due amount when rent amount or late fee changes
  useEffect(() => {
    setDueAmount(rentAmount + lateFee);
  }, [rentAmount, lateFee]);

  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "",
    description: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const paymentAmount = Number(formData.amount);
      const balance = dueAmount - paymentAmount;

      const { error } = await supabase.from("unified_payments").insert({
        lease_id: agreementId,
        amount: dueAmount,
        amount_paid: paymentAmount,
        balance: balance,
        payment_method: formData.paymentMethod,
        description: formData.description,
        payment_date: new Date().toISOString(),
        status: 'completed',
        type: 'Income',
        late_fine_amount: lateFee,
        days_overdue: Math.floor(lateFee / 120)
      });

      if (error) throw error;

      toast.success("Payment added successfully");
      setFormData({
        amount: "",
        paymentMethod: "",
        description: ""
      });
      
      await queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={cn(
        "bg-muted p-4 rounded-lg mb-4",
        "border border-border/50",
        "hover:border-border/80 transition-colors"
      )}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Due Amount</div>
            <div className="text-xl font-semibold">
              {formatCurrency(dueAmount)}
              <div className="text-sm text-muted-foreground mt-1">
                Rent: {formatCurrency(rentAmount)} + Late Fee: {formatCurrency(lateFee)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount" className="text-sm font-medium">
            Amount Paid (QAR)
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            className={cn(
              "mt-1.5",
              isMobile && "h-12 text-lg"
            )}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="paymentMethod" className="text-sm font-medium">
            Payment Method
          </Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value) => handleChange("paymentMethod", value)}
          >
            <SelectTrigger 
              className={cn(
                "mt-1.5 w-full",
                isMobile && "h-12 text-lg"
              )}
            >
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="WireTransfer">Wire Transfer</SelectItem>
              <SelectItem value="Invoice">Invoice</SelectItem>
              <SelectItem value="On_hold">On Hold</SelectItem>
              <SelectItem value="Deposit">Deposit</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Add payment notes or description..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1.5"
            rows={isMobile ? 3 : 4}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className={cn(
          "w-full transition-all",
          isMobile && "h-12 text-lg mt-4"
        )}
      >
        {isSubmitting ? "Adding Payment..." : "Add Payment"}
      </Button>
    </form>
  );
};
