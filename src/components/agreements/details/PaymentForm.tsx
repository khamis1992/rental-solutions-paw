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
import { Controller } from "react-hook-form";
import { usePaymentForm } from "../hooks/usePaymentForm";
import { RecurringPaymentFields } from "../payments/RecurringPaymentFields";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";

interface PaymentFormProps {
  agreementId: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    onSubmit,
    isRecurring,
    setIsRecurring,
    errors,
    isSubmitting,
    lateFineAmount,
    daysOverdue,
    baseAmount,
    totalAmount,
    calculateLateFine
  } = usePaymentForm(agreementId);

  useEffect(() => {
    calculateLateFine();
  }, [calculateLateFine]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        {daysOverdue > 0 && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <p className="font-medium">Payment is overdue by {daysOverdue} days</p>
            <p>Late fine: {formatCurrency(lateFineAmount)}</p>
          </div>
        )}

        <div>
          <Label htmlFor="amount">Base Amount (QAR)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount")}
            disabled
            value={baseAmount}
          />
        </div>

        {lateFineAmount > 0 && (
          <div>
            <Label>Late Fine Amount</Label>
            <Input
              type="number"
              disabled
              value={lateFineAmount}
            />
          </div>
        )}

        <div>
          <Label className="font-bold">Total Amount to Pay</Label>
          <Input
            type="number"
            disabled
            value={totalAmount}
          />
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Controller
            name="paymentMethod"
            control={control}
            rules={{ required: "Payment method is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
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
            )}
          />
          {errors.paymentMethod && (
            <p className="text-sm text-red-500 mt-1">{errors.paymentMethod.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add payment notes or description..."
            {...register("description")}
          />
        </div>
      </div>

      {isRecurring && (
        <RecurringPaymentFields
          register={register}
          control={control}
          errors={errors}
        />
      )}

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Adding Payment..." : "Add Payment"}
      </Button>
    </form>
  );
};