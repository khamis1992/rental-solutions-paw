import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface TaxFilingFormData {
  filing_type: string;
  tax_period_start: string;
  tax_period_end: string;
  due_date: string;
  total_tax_amount: number;
}

export function TaxFilingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<TaxFilingFormData>();

  const onSubmit = async (data: TaxFilingFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("tax_filings").insert({
        ...data,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Tax filing created successfully");
      reset();
      queryClient.invalidateQueries({ queryKey: ["tax-filings"] });
      queryClient.invalidateQueries({ queryKey: ["tax-filing-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-tax-deadlines"] });
    } catch (error) {
      console.error("Error creating tax filing:", error);
      toast.error("Failed to create tax filing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="filing_type">Filing Type</Label>
          <Select {...register("filing_type", { required: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Select filing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vat">VAT Return</SelectItem>
              <SelectItem value="income_tax">Income Tax</SelectItem>
              <SelectItem value="withholding_tax">Withholding Tax</SelectItem>
              <SelectItem value="corporate_tax">Corporate Tax</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_tax_amount">Total Tax Amount</Label>
          <Input
            id="total_tax_amount"
            type="number"
            step="0.01"
            {...register("total_tax_amount", { required: true, min: 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_period_start">Period Start</Label>
          <Input
            id="tax_period_start"
            type="date"
            {...register("tax_period_start", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_period_end">Period End</Label>
          <Input
            id="tax_period_end"
            type="date"
            {...register("tax_period_end", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            {...register("due_date", { required: true })}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Tax Filing"}
      </Button>
    </form>
  );
}