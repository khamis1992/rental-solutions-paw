import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VehicleStatusProps {
  vehicleId: string;
  currentStatus: string;
}

export const VehicleStatus = ({ vehicleId, currentStatus }: VehicleStatusProps) => {
  const [status, setStatus] = useState(currentStatus);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
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
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4" />;
      case "maintenance":
        return <Clock className="h-4 w-4" />;
      case "accident":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({ status: newStatus })
        .eq("id", vehicleId);

      if (error) throw error;

      setStatus(newStatus);
      toast({
        title: "Status Updated",
        description: `Vehicle status has been updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update vehicle status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Vehicle Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(status)} text-white`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(status)}
                {status}
              </span>
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => updateStatus("available")}
              disabled={status === "available"}
            >
              Mark Available
            </Button>
            <Button
              variant="outline"
              onClick={() => updateStatus("maintenance")}
              disabled={status === "maintenance"}
            >
              Mark In Maintenance
            </Button>
            <Button
              variant="outline"
              onClick={() => updateStatus("reserve")}
              disabled={status === "reserve"}
            >
              Mark Reserved
            </Button>
            <Button
              variant="outline"
              onClick={() => updateStatus("accident")}
              disabled={status === "accident"}
            >
              Mark In Accident
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};