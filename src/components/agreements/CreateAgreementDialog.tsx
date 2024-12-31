import { Dispatch, SetStateAction } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateAgreementDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

interface FormData {
  customerName: string;
  agreementType: string;
  amount: number;
  startDate: string;
  endDate: string;
}

export const CreateAgreementDialog = ({ open, onOpenChange }: CreateAgreementDialogProps) => {
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<FormData>();
  const queryClient = useQueryClient();

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from('agreements')
        .insert({
          customer_name: data.customerName,
          agreement_type: data.agreementType,
          amount: data.amount,
          start_date: data.startDate,
          end_date: data.endDate,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Agreement created successfully');
      queryClient.invalidateQueries({ queryKey: ['agreements'] });
      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating agreement:', error);
      toast.error(error.message || 'Failed to create agreement');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              {...register('customerName', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agreementType">Agreement Type</Label>
            <Select {...register('agreementType', { required: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lease">Lease</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              {...register('amount', { required: true, min: 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate', { required: true })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Agreement'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};