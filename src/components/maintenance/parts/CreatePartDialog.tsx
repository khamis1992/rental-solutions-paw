import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface CreatePartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PartFormData {
  part_name: string;
  part_number: string;
  quantity_in_stock: number;
  minimum_stock_level: number;
  reorder_point: number;
  unit_cost: number;
  location: string;
}

export const CreatePartDialog = ({ open, onOpenChange, onSuccess }: CreatePartDialogProps) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<PartFormData>();

  const onSubmit = async (data: PartFormData) => {
    try {
      const { error } = await supabase
        .from('parts_inventory')
        .insert([{
          ...data,
          status: 'active'
        }]);

      if (error) throw error;

      toast.success('Part added successfully');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="part_name">Part Name</Label>
            <Input id="part_name" {...register('part_name', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="part_number">Part Number</Label>
            <Input id="part_number" {...register('part_number')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_in_stock">Initial Stock</Label>
              <Input 
                id="quantity_in_stock" 
                type="number" 
                {...register('quantity_in_stock', { 
                  required: true,
                  valueAsNumber: true,
                  min: 0
                })} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost (QAR)</Label>
              <Input 
                id="unit_cost" 
                type="number" 
                step="0.01" 
                {...register('unit_cost', { 
                  required: true,
                  valueAsNumber: true,
                  min: 0
                })} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_stock_level">Minimum Stock</Label>
              <Input 
                id="minimum_stock_level" 
                type="number" 
                {...register('minimum_stock_level', { 
                  required: true,
                  valueAsNumber: true,
                  min: 0
                })} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input 
                id="reorder_point" 
                type="number" 
                {...register('reorder_point', { 
                  required: true,
                  valueAsNumber: true,
                  min: 0
                })} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Storage Location</Label>
            <Input id="location" {...register('location')} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Part'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};