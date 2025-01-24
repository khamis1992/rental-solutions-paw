import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { VehicleStatus as VehicleStatusType } from "@/types/vehicle";
import { AlertCircle, CheckCircle, Clock, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VehicleStatusProps {
  id: string;
  initialStatus: VehicleStatusType;
}

export const VehicleStatus = ({ id, initialStatus }: VehicleStatusProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      // Delete maintenance record
      const { error: maintenanceError } = await supabase
        .from("maintenance")
        .delete()
        .eq("vehicle_id", id);

      if (maintenanceError) throw maintenanceError;

      // Update vehicle status back to available
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: "available" })
        .eq("id", id);

      if (vehicleError) throw vehicleError;

      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance record deleted successfully");
    } catch (error: any) {
      console.error("Error deleting maintenance:", error);
      toast.error(error.message || "Failed to delete maintenance record");
    }
  };

  const handleStatusChange = async (newStatus: VehicleStatusType) => {
    try {
      // Update vehicle status
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: newStatus })
        .eq("id", id);

      if (vehicleError) throw vehicleError;

      // If changing to maintenance, create a maintenance record
      if (newStatus === "maintenance") {
        const { error: maintenanceError } = await supabase
          .from("maintenance")
          .insert([
            {
              vehicle_id: id,
              service_type: "General Maintenance",
              status: "scheduled",
              scheduled_date: new Date().toISOString(),
              description: "Vehicle status changed to maintenance",
            },
          ]);

        if (maintenanceError) throw maintenanceError;
      }

      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Vehicle status updated successfully");
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const getStatusIcon = (status: VehicleStatusType) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4" />;
      case "maintenance":
        return <Clock className="h-4 w-4" />;
      case "accident":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(initialStatus)}
            <span className="capitalize">{initialStatus}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              Change Status
            </Button>
            {initialStatus === "maintenance" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Maintenance Record</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this maintenance record? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleStatusChange("available")}
            >
              Available
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange("maintenance")}
            >
              Maintenance
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange("accident")}
            >
              Accident
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};