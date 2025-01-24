import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MaintenanceStatusSelectProps {
  id: string;
  status: string;
  vehicleId: string;
}

export const MaintenanceStatusSelect = ({
  id,
  status,
  vehicleId,
}: MaintenanceStatusSelectProps) => {
  const queryClient = useQueryClient();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-500";
      case "in_progress":
        return "text-blue-500";
      case "accident":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("maintenance")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });

      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`${getStatusColor(status)} capitalize`}
        >
          {status}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("scheduled")}>
          Scheduled
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
          In Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
          Completed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("accident")}>
          Accident
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};