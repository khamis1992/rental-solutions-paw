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
import VehicleInspectionDialog from "./inspection/VehicleInspectionDialog";

export function CreateJobDialog() {
  const [open, setOpen] = useState(false);
  const [showInspection, setShowInspection] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [maintenanceId, setMaintenanceId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    category_id: "",
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

  // Fetch maintenance categories
  const { data: categories = [] } = useQuery({
    queryKey: ["maintenance-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_categories")
        .select("*")
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create maintenance record
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance")
        .insert([{
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          status: "scheduled",
        }])
        .select()
        .single();

      if (maintenanceError) throw maintenanceError;

      // Update vehicle status
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: "maintenance" })
        .eq("id", formData.vehicle_id);

      if (vehicleError) throw vehicleError;

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-status-counts"] });

      toast.success("Job card created successfully");
      
      // Store the maintenance ID and show inspection dialog
      setMaintenanceId(maintenanceData.id);
      setShowInspection(true);
      
    } catch (error: any) {
      console.error("Error creating job card:", error);
      toast.error(error.message || "Failed to create job card");
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionComplete = () => {
    setShowInspection(false);
    setOpen(false);
    setFormData({
      vehicle_id: "",
      category_id: "",
      service_type: "",
      description: "",
      scheduled_date: "",
      cost: "",
    });
  };

  return (
    <>
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
              Create a new maintenance job card. After creation, you'll need to perform a vehicle inspection.
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
              <Label htmlFor="category_id">Maintenance Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger id="category_id" aria-label="Select a category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
              {loading ? "Creating..." : "Create and Proceed to Inspection"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {showInspection && maintenanceId && (
        <VehicleInspectionDialog
          open={showInspection}
          onOpenChange={setShowInspection}
          maintenanceId={maintenanceId}
          onComplete={handleInspectionComplete}
        />
      )}
    </>
  );
}