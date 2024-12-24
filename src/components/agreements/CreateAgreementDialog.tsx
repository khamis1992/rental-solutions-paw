import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AgreementForm, AgreementFormData } from "./AgreementForm";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CreateAgreementDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (values: Partial<AgreementFormData>) => {
    try {
      const { data, error } = await supabase
        .from('leases')
        .insert({
          customer_id: values.customerId,
          vehicle_id: values.vehicleId,
          start_date: values.startDate instanceof Date ? values.startDate.toISOString() : values.startDate,
          end_date: values.endDate instanceof Date ? values.endDate.toISOString() : values.endDate,
          rent_amount: values.rentAmount,
          down_payment: values.downPayment,
          status: 'pending_payment',
          agreement_type: values.agreementType,
          notes: values.notes,
          initial_mileage: values.initialMileage,
          total_amount: values.total_amount
        })
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['leases'] });
      toast.success('Agreement created successfully');
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating agreement:', error);
      toast.error(error.message || 'Failed to create agreement');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Agreement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <AgreementForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};