import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { JobCardForm } from "./job-card/JobCardForm";
import { MaintenanceDocumentUpload } from "./job-card/MaintenanceDocumentUpload";
import VehicleInspectionDialog from "./inspection/VehicleInspectionDialog";

type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";

interface EditMaintenanceDialogProps {
  record: {
    id: string;
    vehicle_id: string;
    service_type: string;
    description?: string;
    status: MaintenanceStatus;
    cost?: number;
    scheduled_date: string;
    notes?: string;
    category_id?: string;
  };
}

export function EditMaintenanceDialog({ record }: EditMaintenanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [showInspection, setShowInspection] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    vehicle_id: record.vehicle_id,
    category_id: record.category_id || "",
    service_type: record.service_type,
    description: record.description || "",
    scheduled_date: record.scheduled_date,
    cost: record.cost?.toString() || "",
    status: record.status
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, license_plate");
      
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
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("maintenance")
        .update({
          vehicle_id: formData.vehicle_id,
          category_id: formData.category_id,
          service_type: formData.service_type,
          description: formData.description,
          scheduled_date: formData.scheduled_date,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", record.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance record updated successfully");
      
      // Show inspection dialog after successful update
      setShowInspection(true);
    } catch (error: any) {
      console.error("Error updating maintenance record:", error);
      toast.error("Failed to update maintenance record");
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionComplete = () => {
    setShowInspection(false);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Card</DialogTitle>
          </DialogHeader>
          
          <JobCardForm
            formData={formData}
            vehicles={vehicles}
            categories={categories}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
          />

          <MaintenanceDocumentUpload
            maintenanceId={record.id}
            onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ["maintenance"] })}
          />
        </DialogContent>
      </Dialog>

      {showInspection && (
        <VehicleInspectionDialog
          open={showInspection}
          onOpenChange={setShowInspection}
          maintenanceId={record.id}
          onComplete={handleInspectionComplete}
        />
      )}
    </>
  );
}