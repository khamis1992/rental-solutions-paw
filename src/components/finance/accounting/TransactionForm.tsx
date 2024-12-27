import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TransactionFormData, PaymentCategoryType } from "./types/transaction.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TransactionForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<TransactionFormData>();

  const paymentCategories: PaymentCategoryType[] = [
    'LATE PAYMENT FEE',
    'Administrative Fees',
    'Vehicle Damage Charge',
    'Traffic Fine',
    'RENTAL FEE',
    'Advance Payment',
    'other'
  ];

  const onSubmit = async (data: TransactionFormData) => {
    console.log('Submitting form with data:', data);
    setIsSubmitting(true);
    
    try {
      // Always set type as 'income' for this form
      const transactionData = {
        ...data,
        type: 'income',
        description: `${data.payment_category}: ${data.description}`,
        transaction_date: new Date(data.transaction_date).toISOString(),
      };

      const { error: transactionError } = await supabase
        .from('accounting_transactions')
        .insert([transactionData]);

      if (transactionError) {
        console.error('Transaction insertion error:', transactionError);
        throw transactionError;
      }

      // Also record in transaction_amounts
      const { error: amountError } = await supabase
        .from('transaction_amounts')
        .insert([{
          amount: data.amount,
          type: 'income',
          recorded_date: new Date(data.transaction_date).toISOString()
        }]);

      if (amountError) {
        console.error('Error recording transaction amount:', amountError);
        throw amountError;
      }

      toast({
        title: "Success",
        description: "Transaction added successfully",
      });

      reset();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="number"
          placeholder="Amount"
          step="0.01"
          {...register("amount", { required: true })}
        />
      </div>

      <div>
        <Input
          type="date"
          {...register("transaction_date", { required: true })}
        />
      </div>

      <div>
        <Select 
          onValueChange={(value) => setValue("payment_category", value as PaymentCategoryType)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {paymentCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Input
          placeholder="Description"
          {...register("description", { required: true })}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Transaction"}
      </Button>
    </form>
  );
};