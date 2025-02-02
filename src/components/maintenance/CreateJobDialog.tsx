import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { JobCardForm } from "./job-card/JobCardForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CreateJobDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: vehicles = [] } = useQuery({
    queryKey: ["available-vehicles"],
    queryFn: async () => {
      console.log("Fetching available vehicles...");
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, license_plate")
        .eq("status", "available");

      if (error) throw error;
      console.log("Available vehicles:", data);
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["maintenance-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_categories")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    vehicle_id: "",
    category_id: "",
    service_type: "",
    description: "",
    scheduled_date: "",
    cost: "",
  });

  const checkExistingJobCard = async (vehicleId: string) => {
    console.log("Checking existing job cards for vehicle:", vehicleId);
    const { data, error } = await supabase
      .from("maintenance")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .not('status', 'in', ['completed', 'cancelled']);

    if (error) {
      console.error("Error checking existing job cards:", error);
      throw error;
    }

    console.log("Existing job cards:", data);
    return data.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hasExistingJobCard = await checkExistingJobCard(formData.vehicle_id);
      if (hasExistingJobCard) {
        toast.error(
          "A job card already exists for this vehicle. Please complete or cancel the existing job card first."
        );
        return;
      }

      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .insert([
          {
            vehicle_id: formData.vehicle_id,
            category_id: formData.category_id,
            service_type: formData.service_type,
            description: formData.description,
            scheduled_date: formData.scheduled_date,
            cost: formData.cost ? parseFloat(formData.cost) : null,
            status: "scheduled",
          },
        ])
        .select()
        .single();

      if (maintenanceError) throw maintenanceError;

      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: "maintenance" })
        .eq("id", formData.vehicle_id);

      if (vehicleError) throw vehicleError;

      toast.success("Job card created successfully");
      setOpen(false);
      navigate(`/maintenance/${maintenance.id}/inspection`);
    } catch (error: any) {
      console.error("Error creating job card:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Job Card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Job Card</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] px-1">
          <JobCardForm
            formData={formData}
            vehicles={vehicles}
            categories={categories}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}