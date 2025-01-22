import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleStatus } from "@/types/vehicle";

interface VehicleStatusCellProps {
  status: VehicleStatus;
  onStatusChange: (value: string) => void;
}

export const VehicleStatusCell = ({ 
  status, 
  onStatusChange 
}: VehicleStatusCellProps) => {
  // Define status colors as a constant within the component
  const STATUS_COLORS = {
    available: "#22c55e", // green
    rented: "#3b82f6",    // blue
    maintenance: "#f59e0b", // amber
    retired: "#6b7280",   // gray
    police_station: "#dc2626", // red
    accident: "#ef4444",  // red
    reserve: "#8b5cf6",   // violet
    stolen: "#dc2626"     // red
  };

  return (
    <Select
      value={status}
      onValueChange={onStatusChange}
    >
      <SelectTrigger className="w-[140px]" onClick={(e) => e.stopPropagation()}>
        <SelectValue>
          <Badge
            className="text-white"
            style={{
              backgroundColor: STATUS_COLORS[status] || "#CBD5E1"
            }}
          >
            {status}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_COLORS).map(([statusOption, color]) => (
          <SelectItem key={statusOption} value={statusOption}>
            <Badge
              className="text-white"
              style={{
                backgroundColor: color
              }}
            >
              {statusOption}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};