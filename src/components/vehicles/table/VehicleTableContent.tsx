import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VehicleTableContentProps {
  vehicles: any[];
  onVehicleClick?: (vehicleId: string) => void;
  onStatusChange: (vehicleId: string, newStatus: any) => void;
  onDeleteClick: (vehicleId: string, e: React.MouseEvent) => void;
  onLicensePlateClick: (vehicleId: string, e: React.MouseEvent) => void;
  STATUS_COLORS: Record<string, string>;
}

export const VehicleTableContent = ({
  vehicles,
  onVehicleClick,
  onStatusChange,
  onDeleteClick,
  onLicensePlateClick,
  STATUS_COLORS,
}: VehicleTableContentProps) => {
  // Fetch insurance data for all vehicles
  const { data: insuranceData } = useQuery({
    queryKey: ['vehicleInsurance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_insurance')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Create a map of vehicle IDs to their insurance data
  const insuranceMap = new Map(
    insuranceData?.map(insurance => [insurance.vehicle_id, insurance])
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Make</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>License Plate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Insurance Provider</TableHead>
          <TableHead>Policy Number</TableHead>
          <TableHead>Coverage</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => {
          const insurance = insuranceMap.get(vehicle.id);
          return (
            <TableRow
              key={vehicle.id}
              className="cursor-pointer"
              onClick={() => onVehicleClick?.(vehicle.id)}
            >
              <TableCell>{vehicle.make}</TableCell>
              <TableCell>{vehicle.model}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>
                <Button
                  variant="link"
                  onClick={(e) => onLicensePlateClick(vehicle.id, e)}
                >
                  {vehicle.license_plate}
                </Button>
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={vehicle.status}
                  onValueChange={(value) => onStatusChange(vehicle.id, value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <Badge
                        style={{
                          backgroundColor: STATUS_COLORS[vehicle.status],
                          color: 'white',
                        }}
                      >
                        {vehicle.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATUS_COLORS).map((status) => (
                      <SelectItem key={status} value={status}>
                        <Badge
                          style={{
                            backgroundColor: STATUS_COLORS[status],
                            color: 'white',
                          }}
                        >
                          {status}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{insurance?.provider || 'N/A'}</TableCell>
              <TableCell>{insurance?.policy_number || 'N/A'}</TableCell>
              <TableCell>
                {insurance ? `$${insurance.coverage_amount.toLocaleString()}` : 'N/A'}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => onDeleteClick(vehicle.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};