import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AssignFineDialogProps {
  fineId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignFineDialog = ({
  fineId,
  open,
  onOpenChange,
}: AssignFineDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agreements, isLoading } = useQuery({
    queryKey: ['agreements-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          agreement_number,
          vehicle:vehicles (
            license_plate
          ),
          customer:profiles (
            full_name
          )
        `)
        .or(`agreement_number.ilike.%${searchTerm}%,vehicle.license_plate.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!searchTerm,
  });

  const assignFine = async (agreementId: string) => {
    try {
      const { error } = await supabase
        .from('traffic_fines')
        .update({
          lease_id: agreementId,
          assignment_status: 'assigned'
        })
        .eq('id', fineId);

      if (error) throw error;

      toast({
        title: "Fine Assigned",
        description: "The traffic fine has been successfully assigned.",
      });

      // Refresh queries
      await queryClient.invalidateQueries({ queryKey: ['traffic-fines'] });
      await queryClient.invalidateQueries({ queryKey: ['unassigned-fines'] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Traffic Fine</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Search Agreement</Label>
            <Input
              placeholder="Enter agreement number or license plate"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div>Searching agreements...</div>
            ) : agreements?.length ? (
              agreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      Agreement: {agreement.agreement_number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {agreement.customer?.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Vehicle: {agreement.vehicle?.license_plate}
                    </div>
                  </div>
                  <Button onClick={() => assignFine(agreement.id)}>
                    Assign Fine
                  </Button>
                </div>
              ))
            ) : searchTerm ? (
              <div className="text-center text-muted-foreground">
                No matching agreements found
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};