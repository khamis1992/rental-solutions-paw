import { Badge } from "@/components/ui/badge";
import { VehicleStatus } from "@/types/vehicle";
import { Car, Wrench, Ban, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleStatusCellProps {
  status: VehicleStatus;
  vehicleId: string;
}

export const VehicleStatusCell = ({ status }: VehicleStatusCellProps) => {
  const getStatusConfig = (status: VehicleStatus) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-green-500/15 text-green-700 hover:bg-green-500/25',
          icon: Car,
          label: 'Available'
        };
      case 'rented':
        return {
          color: 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25',
          icon: Car,
          label: 'Rented'
        };
      case 'maintenance':
        return {
          color: 'bg-orange-500/15 text-orange-700 hover:bg-orange-500/25',
          icon: Wrench,
          label: 'Maintenance'
        };
      case 'retired':
        return {
          color: 'bg-gray-500/15 text-gray-700 hover:bg-gray-500/25',
          icon: Ban,
          label: 'Retired'
        };
      case 'accident':
        return {
          color: 'bg-red-500/15 text-red-700 hover:bg-red-500/25',
          icon: AlertTriangle,
          label: 'Accident'
        };
      default:
        return {
          color: 'bg-gray-500/15 text-gray-700 hover:bg-gray-500/25',
          icon: Car,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary"
      className={cn(
        "gap-1.5 pl-2 pr-2.5 py-0.5 font-medium capitalize",
        config.color
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};