import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VehicleStatus as VehicleStatusType } from "@/types/vehicle";

interface VehicleStatusProps {
  vehicleId: string;
  currentStatus: VehicleStatusType;
}

export const VehicleStatus = ({ vehicleId, currentStatus }: VehicleStatusProps) => {
  const [status, setStatus] = useState<VehicleStatusType>(currentStatus);
  const queryClient = useQueryClient();

  // Fetch available statuses from the database
  const { data: availableStatuses } = useQuery({
    queryKey: ["vehicle-statuses"],
    queryFn: async () => {
      console.log("Fetching vehicle statuses"); // Debug log
      const { data, error } = await supabase
        .from("vehicle_statuses")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching vehicle statuses:", error);
        throw error;
      }

      console.log("Available statuses:", data); // Debug log
      return data;
    },
  });

  const getStatusColor = (status: VehicleStatusType) => {
    console.log("Getting color for status:", status); // Debug log
    switch (status) {
      case "available":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "rented":
        return "bg-blue-500";
      case "accident":
        return "bg-red-500";
      case "reserve":
        return "bg-purple-500";
      case "police_station":
        return "bg-pink-500";
      case "stolen":
        return "bg-red-700";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: VehicleStatusType) => {
    console.log("Getting icon for status:", status); // Debug log
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4" />;
      case "maintenance":
        return <Clock className="h-4 w-4" />;
      case "accident":
      case "stolen":
      case "police_station":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const updateStatus = async (newStatus: VehicleStatusType) => {
    try {
      console.log("Attempting to update status to:", newStatus); // Debug log
      console.log("Vehicle ID:", vehicleId); // Debug log
      
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: newStatus })
        .eq("id", vehicleId);

      if (vehicleError) {
        console.error("Error updating status:", vehicleError); // Debug log
        toast.error("Failed to update vehicle status");
        throw vehicleError;
      }

      // If status is changed to maintenance, create a maintenance record
      if (newStatus === "maintenance") {
        const { error: maintenanceError } = await supabase
          .from("maintenance")
          .insert([
            {
              vehicle_id: vehicleId,
              service_type: "General Maintenance",
              status: "scheduled",
              description: "Vehicle status changed to maintenance",
              scheduled_date: new Date().toISOString(),
              category_id: (await supabase
                .from("maintenance_categories")
                .select("id")
                .eq("name", "General")
                .single()
              ).data?.id,
            },
          ]);

        if (maintenanceError) {
          console.error("Error creating maintenance record:", maintenanceError);
          toast.error("Failed to create maintenance record");
          throw maintenanceError;
        }
      }

      setStatus(newStatus);
      toast.success("Vehicle status updated successfully");
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-status-counts"] });
      
      console.log("Status updated successfully"); // Debug log
    } catch (error) {
      console.error("Error in updateStatus:", error); // Debug log
      toast.error("Failed to update vehicle status");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Vehicle Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`${getStatusColor(status)} text-white px-3 py-1 rounded-full flex items-center gap-1`}>
              {getStatusIcon(status)}
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {availableStatuses?.map((statusOption) => (
              <Button
                key={statusOption.id}
                variant="outline"
                onClick={() => {
                  console.log("Button clicked for status:", statusOption.name); // Debug log
                  updateStatus(statusOption.name as VehicleStatusType);
                }}
                disabled={status === statusOption.name}
              >
                Mark as {statusOption.name.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};