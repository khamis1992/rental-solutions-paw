import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleStatusCellProps {
  status: string;
  onStatusChange: (value: string) => void;
  statusColors: Record<string, string>;
}

export const VehicleStatusCell = ({ 
  status, 
  onStatusChange, 
  statusColors 
}: VehicleStatusCellProps) => {
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
              backgroundColor: statusColors[status] || "#CBD5E1"
            }}
          >
            {status}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.keys(statusColors).map((statusOption) => (
          <SelectItem key={statusOption} value={statusOption}>
            <Badge
              className="text-white"
              style={{
                backgroundColor: statusColors[statusOption]
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