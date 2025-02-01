import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { JobCardForm } from "./job-card/JobCardForm";
import { MaintenanceDocumentUpload } from "./job-card/MaintenanceDocumentUpload";
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

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      console.log("Fetching available vehicles...");
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, license_plate")
        .eq('status', 'available');
      
      if (error) throw error;
      console.log("Available vehicles:", data);
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["maintenance-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_categories")
        .select("*")
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Add a function to check for existing job cards
  const checkExistingJobCard = async (vehicleId: string) => {
    const { data, error } = await supabase
      .from("maintenance")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .not("status", "in", ("completed", "cancelled"));

    if (error) {
      console.error("Error checking existing job cards:", error);
      return true; // Return true to prevent creation if there's an error
    }

    return data && data.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for existing job card
      const hasExistingJobCard = await checkExistingJobCard(formData.vehicle_id);
      
      if (hasExistingJobCard) {
        toast.error("A job card already exists for this vehicle. Please complete or cancel the existing job card first.");
        setLoading(false);
        return;
      }

      console.log("Creating maintenance record for vehicle:", formData.vehicle_id);
      
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance")
        .insert([{
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          status: "scheduled",
        }])
        .select()
        .single();

      if (maintenanceError) {
        console.error("Error creating maintenance record:", maintenanceError);
        toast.error("Failed to create maintenance record");
        throw maintenanceError;
      }

      console.log("Maintenance record created successfully:", maintenanceData);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicle-status-counts"] })
      ]);

      toast.success("Job card created successfully");
      
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