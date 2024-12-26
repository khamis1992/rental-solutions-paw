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
import { Trash2, MapPin, Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  vin: string;
  mileage: number;
  license_plate: string;
  location: string | null;
  insurance_company: string | null;
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
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [locationValue, setLocationValue] = useState("");
  const [editingInsurance, setEditingInsurance] = useState<string | null>(null);
  const [insuranceValue, setInsuranceValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to real-time updates for vehicle location and insurance changes
    const channel = supabase
      .channel('vehicle-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: 'location=neq.null OR insurance_company=neq.null'
        },
        (payload: any) => {
          const updatedVehicle = payload.new;
          if (updatedVehicle.location) {
            toast({
              title: "Location Updated",
              description: `${updatedVehicle.make} ${updatedVehicle.model} location updated to ${updatedVehicle.location}`,
            });
          }
          if (updatedVehicle.insurance_company) {
            toast({
              title: "Insurance Company Updated",
              description: `${updatedVehicle.make} ${updatedVehicle.model} insurance company updated to ${updatedVehicle.insurance_company}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleLocationClick = (vehicle: Vehicle) => {
    setEditingLocation(vehicle.id);
    setLocationValue(vehicle.location || "");
  };

  const handleInsuranceClick = (vehicle: Vehicle) => {
    setEditingInsurance(vehicle.id);
    setInsuranceValue(vehicle.insurance_company || "");
  };

  const handleLocationUpdate = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ location: locationValue })
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Location updated",
        description: "Vehicle location has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle location",
        variant: "destructive",
      });
    }
    setEditingLocation(null);
  };

  const handleInsuranceUpdate = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ insurance_company: insuranceValue })
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Insurance company updated",
        description: "Vehicle insurance company has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating insurance company:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle insurance company",
        variant: "destructive",
      });
    }
    setEditingInsurance(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, vehicleId: string, type: 'location' | 'insurance') => {
    if (e.key === 'Enter') {
      if (type === 'location') {
        handleLocationUpdate(vehicleId);
      } else {
        handleInsuranceUpdate(vehicleId);
      }
    } else if (e.key === 'Escape') {
      if (type === 'location') {
        setEditingLocation(null);
      } else {
        setEditingInsurance(null);
      }
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>License Plate</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Insurance Company</TableHead>
          <TableHead>VIN</TableHead>
          <TableHead>Mileage</TableHead>
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
                <SelectTrigger className="w-[140px]" onClick={(e) => e.stopPropagation()}>
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
            <TableCell onClick={(e) => {
              e.stopPropagation();
              handleLocationClick(vehicle);
            }}>
              {editingLocation === vehicle.id ? (
                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                  <Input
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, vehicle.id, 'location')}
                    onBlur={() => handleLocationUpdate(vehicle.id)}
                    autoFocus
                    className="w-full"
                    placeholder="Enter location"
                  />
                </div>
              ) : (
                <div className="flex items-center hover:bg-gray-100 p-2 rounded">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vehicle.location || <span className="text-muted-foreground">Not available</span>}
                </div>
              )}
            </TableCell>
            <TableCell onClick={(e) => {
              e.stopPropagation();
              handleInsuranceClick(vehicle);
            }}>
              {editingInsurance === vehicle.id ? (
                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                  <Input
                    value={insuranceValue}
                    onChange={(e) => setInsuranceValue(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, vehicle.id, 'insurance')}
                    onBlur={() => handleInsuranceUpdate(vehicle.id)}
                    autoFocus
                    className="w-full"
                    placeholder="Enter insurance company"
                  />
                </div>
              ) : (
                <div className="flex items-center hover:bg-gray-100 p-2 rounded">
                  <Building2 className="h-4 w-4 mr-1" />
                  {vehicle.insurance_company || <span className="text-muted-foreground">Not available</span>}
                </div>
              )}
            </TableCell>
            <TableCell>{vehicle.vin}</TableCell>
            <TableCell>{vehicle.mileage?.toLocaleString() || 0} km</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={(e) => onDeleteClick(vehicle.id, e)}
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