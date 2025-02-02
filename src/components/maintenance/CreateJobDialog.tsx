import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreateJobDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  vehicleId: string;
}

export function CreateJobDialog({ 
  open: controlledOpen, 
  onOpenChange, 
  children,
  vehicleId 
}: CreateJobDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const queryClient = useQueryClient();

  const checkExistingJobCard = async (vehicleId: string) => {
    console.log("Checking existing job cards for vehicle:", vehicleId);
    try {
      const { data: existingMaintenance } = await supabase
        .from('maintenance')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .not('status', 'in', '("completed","cancelled")')
        .single();

      return existingMaintenance;
    } catch (error) {
      console.error("Error checking existing job cards:", error);
      throw error;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Check for existing job card
      const existingCard = await checkExistingJobCard(vehicleId);
      if (existingCard) {
        toast.error("There is already an active job card for this vehicle");
        return;
      }

      // Create new maintenance record
      const { data, error } = await supabase
        .from('maintenance')
        .insert([{
          vehicle_id: vehicleId,
          service_type: serviceType,
          description: description,
          status: 'scheduled',
          scheduled_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Update vehicle status
      await supabase
        .from('vehicles')
        .update({ status: 'maintenance' })
        .eq('id', vehicleId);

      toast.success("Job card created successfully");
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onOpenChange?.(false);
    } catch (error) {
      console.error("Error creating job card:", error);
      toast.error("Failed to create job card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={controlledOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Job Card</DialogTitle>
          <DialogDescription>
            Create a new maintenance job card for the vehicle
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Textarea
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="Enter the type of service needed..."
                className="min-h-[60px]"
                required
              />
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the maintenance work needed..."
                className="min-h-[100px]"
                required
              />
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="relative"
              >
                {isSubmitting ? (
                  <>
                    <span className="opacity-0">Create Job Card</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  </>
                ) : (
                  "Create Job Card"
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}