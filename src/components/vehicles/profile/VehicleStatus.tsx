import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleStatus as VehicleStatusType } from "@/types/vehicle";
import { useQuery } from "@tanstack/react-query";

interface VehicleStatusProps {
  vehicleId: string;
  currentStatus: VehicleStatusType;
}

export const VehicleStatus = ({ vehicleId, currentStatus }: VehicleStatusProps) => {
  const [status, setStatus] = useState<VehicleStatusType>(currentStatus);

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
      
      const { error } = await supabase
        .from("vehicles")
        .update({ status: newStatus })
        .eq("id", vehicleId);

      if (error) {
        console.error("Error updating status:", error); // Debug log
        toast.error("Failed to update vehicle status");
        throw error;
      }

      setStatus(newStatus);
      toast.success("Vehicle status updated successfully");
      
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