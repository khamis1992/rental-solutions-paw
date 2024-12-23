import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CostTypeSelect } from "./components/CostTypeSelect";
import { saveTransaction, uploadReceipt } from "./utils/transactionUtils";
import { TransactionFormData } from "./types/transaction.types";
import { Switch } from "@/components/ui/switch";

export function TransactionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch } = useForm<TransactionFormData>();
  const transactionType = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      let receiptUrl = null;

      if (data.receipt && data.receipt[0]) {
        receiptUrl = await uploadReceipt(data.receipt[0]);
      }

      // If it's a payment transaction, create a payment record
      if (data.type === 'payment') {
        const paymentData = {
          amount: data.amount,
          payment_method: data.paymentMethod,
          description: data.description,
          payment_date: new Date().toISOString(),
          is_recurring: isRecurring,
          recurring_interval: isRecurring ? `${data.intervalValue} ${data.intervalUnit}` : null,
          next_payment_date: isRecurring ? 
            new Date(Date.now() + getIntervalInMilliseconds(data.intervalValue, data.intervalUnit)).toISOString() : 
            null
        };

        const { error: paymentError } = await supabase.from("payments").insert(paymentData);
        if (paymentError) throw paymentError;
      } else {
        // Regular transaction
        await saveTransaction(data, receiptUrl);
      }

      toast.success(data.type === 'payment' ? "Payment added successfully" : "Transaction added successfully");
      reset();
      queryClient.invalidateQueries({ queryKey: ["accounting-transactions"] });
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIntervalInMilliseconds = (value: number, unit: string) => {
    const milliseconds = {
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
      months: 30 * 24 * 60 * 60 * 1000
    };
    return value * milliseconds[unit as keyof typeof milliseconds];
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Transaction Type</Label>
          <Select {...register("type")} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter amount"
            {...register("amount", { required: true, min: 0 })}
          />
        </div>

        {transactionType === 'expense' && (
          <CostTypeSelect register={register} />
        )}

        {transactionType === 'payment' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select {...register("paymentMethod", { required: transactionType === 'payment' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                aria-label="Enable recurring payments"
              />
              <Label htmlFor="recurring">Recurring Payment</Label>
            </div>

            {isRecurring && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="intervalValue">Repeat Every</Label>
                  <Input
                    id="intervalValue"
                    type="number"
                    min="1"
                    {...register("intervalValue", { required: isRecurring })}
                    aria-label="Interval value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intervalUnit">Unit</Label>
                  <Select {...register("intervalUnit", { required: isRecurring })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </>
        )}

        {transactionType !== 'payment' && (
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select {...register("category_id")} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {/* Fetch and display categories here */}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="transaction_date">Date</Label>
          <Input
            id="transaction_date"
            type="date"
            {...register("transaction_date", { required: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter transaction description"
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt">Receipt (optional)</Label>
        <Input
          id="receipt"
          type="file"
          accept="image/*,.pdf"
          {...register("receipt")}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {transactionType === 'payment' ? 'Adding Payment...' : 'Adding Transaction...'}
          </>
        ) : (
          transactionType === 'payment' ? 'Add Payment' : 'Add Transaction'
        )}
      </Button>
    </form>
  );
}
