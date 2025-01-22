import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { VehicleLocationCell } from "./VehicleLocationCell";
import { VehicleInsuranceCell } from "./VehicleInsuranceCell";
import { Vehicle } from "@/types/vehicle";

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
              <VehicleStatusCell
                status={vehicle.status}
                onStatusChange={(value) => onStatusChange(vehicle.id, value)}
                statusColors={STATUS_COLORS}
              />
            </TableCell>
            <TableCell>
              <VehicleLocationCell
                vehicleId={vehicle.id}
                isEditing={editingLocation === vehicle.id}
                location={vehicle.location}
                locationValue={locationValue}
                onLocationChange={setLocationValue}
                onKeyPress={(e) => handleKeyPress(e, vehicle.id, 'location')}
                onBlur={() => handleLocationUpdate(vehicle.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingLocation(vehicle.id);
                  setLocationValue(vehicle.location || "");
                }}
              />
            </TableCell>
            <TableCell>
              <VehicleInsuranceCell
                isEditing={editingInsurance === vehicle.id}
                insurance={vehicle.insurance_company}
                insuranceValue={insuranceValue}
                onInsuranceChange={setInsuranceValue}
                onKeyPress={(e) => handleKeyPress(e, vehicle.id, 'insurance')}
                onBlur={() => handleInsuranceUpdate(vehicle.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingInsurance(vehicle.id);
                  setInsuranceValue(vehicle.insurance_company || "");
                }}
              />
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