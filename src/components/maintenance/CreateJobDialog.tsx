import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import VehicleInspectionDialog from "./inspection/VehicleInspectionDialog";
import { JobCardForm } from "./job-card/JobCardForm";
import { MaintenanceDocumentUpload } from "./job-card/MaintenanceDocumentUpload";

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
      // Start a Supabase transaction
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

      // Update vehicle status to maintenance
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: "maintenance" })
        .eq("id", formData.vehicle_id);

      if (vehicleError) {
        // Rollback maintenance record if vehicle update fails
        await supabase
          .from("maintenance")
          .delete()
          .eq("id", maintenanceData.id);
        throw vehicleError;
      }

      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicle-status-counts"] })
      ]);

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
          
          <JobCardForm
            formData={formData}
            vehicles={vehicles}
            categories={categories}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
          />

          {maintenanceId && (
            <MaintenanceDocumentUpload
              maintenanceId={maintenanceId}
              onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ["maintenance"] })}
            />
          )}
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