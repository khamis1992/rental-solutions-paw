import { Badge } from "@/components/ui/badge";
import { VehicleStatus } from "@/types/vehicle";

interface VehicleStatusCellProps {
  status: VehicleStatus;
}

export const VehicleStatusCell = ({ status }: VehicleStatusCellProps) => {
  const STATUS_COLORS = {
    available: "#22c55e",    // green
    rented: "#3b82f6",      // blue
    maintenance: "#f59e0b",  // amber
    retired: "#6b7280",     // gray
    police_station: "#dc2626", // red
    accident: "#ef4444",    // red
    reserve: "#8b5cf6",     // violet
    stolen: "#dc2626"       // red
  };

  return (
    <Badge
      className="text-white"
      style={{
        backgroundColor: STATUS_COLORS[status] || "#CBD5E1" // fallback color
      }}
    >
      {status}
    </Badge>
  );
};