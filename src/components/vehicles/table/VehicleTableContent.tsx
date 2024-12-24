import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  vin: string;
  mileage: number;
  license_plate: string;
}

interface VehicleTableContentProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicleId: string) => void;
  onStatusChange: (vehicleId: string, newStatus: string) => void;
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
  // Query to fetch document counts for each vehicle
  const { data: documentCounts } = useQuery({
    queryKey: ['vehicle-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .select('vehicle_id, id')
        .in('vehicle_id', vehicles.map(v => v.id));

      if (error) throw error;

      // Count documents per vehicle
      const counts: Record<string, number> = {};
      data.forEach(doc => {
        counts[doc.vehicle_id] = (counts[doc.vehicle_id] || 0) + 1;
      });
      return counts;
    },
    enabled: vehicles.length > 0,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>License Plate</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>VIN</TableHead>
          <TableHead>Mileage</TableHead>
          <TableHead>Documents</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow
            key={vehicle.id}
            className="cursor-pointer"
            onClick={() => onVehicleClick?.(vehicle.id)}
          >
            <TableCell>
              <button
                onClick={(e) => onLicensePlateClick(vehicle.id, e)}
                className="font-medium text-primary hover:underline focus:outline-none"
              >
                {vehicle.license_plate}
              </button>
            </TableCell>
            <TableCell>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </TableCell>
            <TableCell>
              <Select
                value={vehicle.status}
                onValueChange={(value) => onStatusChange(vehicle.id, value)}
              >
                <SelectTrigger 
                  className="w-[140px]" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue>
                    <Badge
                      className="text-white"
                      style={{
                        backgroundColor: STATUS_COLORS[vehicle.status] || "#CBD5E1"
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
                        className="text-white"
                        style={{
                          backgroundColor: STATUS_COLORS[status]
                        }}
                      >
                        {status}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{vehicle.vin}</TableCell>
            <TableCell>{vehicle.mileage?.toLocaleString() || 0} km</TableCell>
            <TableCell>
              {documentCounts?.[vehicle.id] ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FileText 
                      className="h-4 w-4 text-blue-500" 
                      aria-label="Document Count"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{documentCounts[vehicle.id]} document{documentCounts[vehicle.id] > 1 ? 's' : ''} available</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-muted-foreground text-sm">No documents</span>
              )}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(vehicle.id, e);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};