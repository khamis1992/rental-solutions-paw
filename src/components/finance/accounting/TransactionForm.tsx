import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethodSelect } from "./components/PaymentMethodSelect";
import { RecurringPaymentFields } from "./components/RecurringPaymentFields";
import { PaymentMethodType } from "@/types/database/agreement.types";
import { TRANSACTION_CATEGORIES } from "./constants/transactionCategories";
import { format, parse } from "date-fns";

interface TransactionFormData {
  type: 'income' | 'expense' | 'payment';
  amount: number;
  description?: string;
  transaction_date: string;
  payment_method?: PaymentMethodType;
  intervalValue?: string;
  intervalUnit?: string;
  category_id?: string;
}

export function TransactionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch, setValue } = useForm<TransactionFormData>();
  const transactionType = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    console.log("Submitting form with data:", data);
    setIsSubmitting(true);
    try {
      // Parse the date from DD/MM/YYYY format to ISO string
      const parsedDate = parse(data.transaction_date, 'dd/MM/yyyy', new Date());
      const isoDate = parsedDate.toISOString();

      if (data.type === 'payment') {
        const paymentData = {
          amount: data.amount,
          payment_method: data.payment_method,
          description: data.description,
          payment_date: isoDate,
          is_recurring: isRecurring,
          recurring_interval: isRecurring ? `${data.intervalValue} ${data.intervalUnit}` : null,
          next_payment_date: isRecurring ? 
            new Date(Date.now() + getIntervalInMilliseconds(Number(data.intervalValue), data.intervalUnit!)).toISOString() : 
            null,
          lease_id: null
        };

        console.log("Payment data to be inserted:", paymentData);
        const { error: paymentError } = await supabase
          .from("payments")
          .insert(paymentData);
          
        if (paymentError) {
          console.error("Payment insertion error:", paymentError);
          throw paymentError;
        }
      } else {
        // Regular transaction handling
        const transactionData = {
          type: data.type,
          amount: data.amount,
          description: data.description,
          transaction_date: isoDate,
          category_id: data.category_id,
        };

        const { error: transactionError } = await supabase
          .from("accounting_transactions")
          .insert(transactionData);
          
        if (transactionError) {
          console.error("Transaction insertion error:", transactionError);
          throw transactionError;
        }
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

  const handlePaymentMethodChange = (value: PaymentMethodType) => {
    setValue('payment_method', value);
  };

  // Format today's date as DD/MM/YYYY
  const today = format(new Date(), 'dd/MM/yyyy');

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

        {transactionType === 'payment' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <PaymentMethodSelect
                value={watch('payment_method')}
                onChange={handlePaymentMethodChange}
              />
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
              <RecurringPaymentFields
                intervalValue={watch('intervalValue') || ''}
                intervalUnit={watch('intervalUnit') || ''}
                onIntervalValueChange={(value) => setValue('intervalValue', value)}
                onIntervalUnitChange={(value) => setValue('intervalUnit', value)}
              />
            )}
          </>
        )}

        {transactionType !== 'payment' && (
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="transaction_date">Date</Label>
          <Input
            id="transaction_date"
            type="text"
            placeholder="DD/MM/YYYY"
            defaultValue={today}
            {...register("transaction_date", { 
              required: true,
              pattern: {
                value: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/,
                message: "Please enter a valid date in DD/MM/YYYY format"
              }
            })}
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