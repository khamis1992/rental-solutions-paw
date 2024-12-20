import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wrench, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface DamageHistoryProps {
  vehicleId: string;
}

interface DamageFormData {
  description: string;
  repair_cost: number;
  notes?: string;
}

export const DamageHistory = ({ vehicleId }: DamageHistoryProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: damages, isLoading } = useQuery({
    queryKey: ["damages", vehicleId],
    queryFn: async () => {
      // First, get maintenance records for this vehicle
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("service_type, description, cost, scheduled_date")
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (maintenanceError) throw maintenanceError;

      // Then get damage records
      const { data: damageData, error: damageError } = await supabase
        .from("damages")
        .select("*, leases(customer_id, profiles(full_name))")
        .eq("leases.vehicle_id", vehicleId)
        .order("reported_date", { ascending: false });

      if (damageError) throw damageError;

      return {
        maintenance: maintenanceData || [],
        damages: damageData || []
      };
    },
  });

  const addDamageMutation = useMutation({
    mutationFn: async (data: DamageFormData) => {
      const { error } = await supabase
        .from("damages")
        .insert([
          {
            vehicle_id: vehicleId,
            description: data.description,
            repair_cost: data.repair_cost,
            notes: data.notes,
            status: 'reported',
            lease_id: null // Add a null lease_id since it's required by the schema
          }
        ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["damages", vehicleId] });
      toast({
        title: "Success",
        description: "Damage report added successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add damage report",
        variant: "destructive",
      });
      console.error("Error adding damage:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addDamageMutation.mutate({
      description: formData.get("description") as string,
      repair_cost: Number(formData.get("repair_cost")),
      notes: formData.get("notes") as string,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Damage & Service History
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Damage Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Damage Report</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the damage"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="repair_cost" className="text-sm font-medium">
                    Repair Cost
                  </label>
                  <Input
                    id="repair_cost"
                    name="repair_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter repair cost"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional notes"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Submit Report
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Maintenance Records */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Wrench className="mr-2 h-4 w-4" />
              Service Records
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {damages?.maintenance.map((record, index) => (
                  <TableRow key={`maintenance-${index}`}>
                    <TableCell>
                      {new Date(record.scheduled_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.service_type}</TableCell>
                    <TableCell>{record.description || 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(record.cost || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Damage Records */}
          <div>
            <h3 className="text-sm font-medium mb-3">Damage Reports</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Repair Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {damages?.damages.map((damage) => (
                  <TableRow key={damage.id}>
                    <TableCell>
                      {new Date(damage.reported_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{damage.description}</TableCell>
                    <TableCell>
                      {(damage.leases as any)?.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{formatCurrency(damage.repair_cost || 0)}</TableCell>
                    <TableCell className="capitalize">{damage.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
