import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreateJobDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vehicle_id: "",
    service_type: "",
    description: "",
    scheduled_date: "",
    cost: "",
  });

  // Fetch available vehicles
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, license_plate")
        .eq('status', 'available');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Start a transaction by using multiple operations
      // 1. Create maintenance record
      const { error: maintenanceError } = await supabase
        .from("maintenance")
        .insert([{
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          status: "scheduled",
        }]);

      if (maintenanceError) throw maintenanceError;

      // 2. Update vehicle status
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: "maintenance" })
        .eq("id", formData.vehicle_id);

      if (vehicleError) throw vehicleError;

      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-status-counts"] });

      toast.success("Job card created successfully");
      setOpen(false);
      setFormData({
        vehicle_id: "",
        service_type: "",
        description: "",
        scheduled_date: "",
        cost: "",
      });
    } catch (error: any) {
      console.error("Error creating job card:", error);
      toast.error(error.message || "Failed to create job card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Job Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Card</DialogTitle>
          <DialogDescription>
            Create a new maintenance job card. After creation, you can perform a vehicle inspection with AI-powered damage detection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">Vehicle</Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
              required
            >
              <SelectTrigger id="vehicle_id" aria-label="Select a vehicle">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Input
              id="service_type"
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              required
              placeholder="Enter service type"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the maintenance needed"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Scheduled Date</Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Estimated Cost</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Job Card"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}