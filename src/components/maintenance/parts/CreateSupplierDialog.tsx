import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface CreateSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface SupplierFormData {
  supplier_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  preferred_supplier: boolean;
  lead_time_days: number;
}

export const CreateSupplierDialog = ({ open, onOpenChange, onSuccess }: CreateSupplierDialogProps) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SupplierFormData>();

  const onSubmit = async (data: SupplierFormData) => {
    try {
      const { error } = await supabase
        .from('parts_suppliers')
        .insert([data]);

      if (error) throw error;

      toast.success('Supplier added successfully');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Failed to add supplier');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name</Label>
            <Input 
              id="supplier_name" 
              {...register('supplier_name', { required: true })} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input 
              id="contact_person" 
              {...register('contact_person')} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...register('email')} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              {...register('phone')} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              {...register('address')} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
            <Input 
              id="lead_time_days" 
              type="number" 
              {...register('lead_time_days', { 
                valueAsNumber: true,
                min: 1 
              })} 
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="preferred_supplier">Preferred Supplier</Label>
            <Switch 
              id="preferred_supplier" 
              {...register('preferred_supplier')} 
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};