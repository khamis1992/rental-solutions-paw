import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/database/vehicle.types";
import { useState, useEffect } from "react";
import { VehicleLocationCell } from "./VehicleLocationCell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleListViewProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicleId: string) => void;
}

export const VehicleListView = ({ vehicles, onVehicleClick }: VehicleListViewProps) => {
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [locationValue, setLocationValue] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel('vehicle-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: 'location=neq.null'
        },
        (payload: any) => {
          const updatedVehicle = payload.new;
          if (updatedVehicle.location) {
            toast(`Vehicle location updated to ${updatedVehicle.location}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClick = (vehicleId: string) => {
    console.log("Button clicked for vehicle:", vehicleId);
    onVehicleClick?.(vehicleId);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {vehicle.image_url && (
                    <img
                      src={vehicle.image_url}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{vehicle.license_plate}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    vehicle.status === "available"
                      ? "default"
                      : vehicle.status === "rented"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {vehicle.status}
                </Badge>
              </TableCell>
              <TableCell>
                <VehicleLocationCell
                  vehicleId={vehicle.id}
                  isEditing={editingLocation === vehicle.id}
                  location={vehicle.location}
                  locationValue={locationValue}
                  onLocationChange={setLocationValue}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setEditingLocation(null);
                    } else if (e.key === 'Escape') {
                      setEditingLocation(null);
                    }
                  }}
                  onBlur={() => setEditingLocation(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingLocation(vehicle.id);
                    setLocationValue(vehicle.location || "");
                  }}
                />
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleClick(vehicle.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};