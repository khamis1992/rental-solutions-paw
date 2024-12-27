import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { Vehicle } from "@/types/database/vehicle.types";
import { Input } from "@/components/ui/input";

interface VehicleGridProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

export const VehicleGrid = ({ vehicles, isLoading, onVehicleClick }: VehicleGridProps) => {
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [locationValue, setLocationValue] = useState("");

  useEffect(() => {
    // Subscribe to real-time location updates
    const channel = supabase
      .channel('vehicle-locations')
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
            toast({
              title: "Location Updated",
              description: `${updatedVehicle.make} ${updatedVehicle.model} location updated to ${updatedVehicle.location}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 rounded-b-none" />
            <CardContent className="mt-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const handleLocationUpdate = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ location: locationValue })
        .eq('id', vehicleId);

      if (error) throw error;

      toast.success("Location updated successfully");
      setEditingLocation(null);
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error("Failed to update location");
    }
  };

  const handleLocationClick = (e: React.MouseEvent, vehicleId: string, currentLocation: string | null) => {
    e.stopPropagation();
    setEditingLocation(vehicleId);
    setLocationValue(currentLocation || "");
  };

  const handleKeyPress = async (e: React.KeyboardEvent, vehicleId: string) => {
    if (e.key === 'Enter') {
      await handleLocationUpdate(vehicleId);
    } else if (e.key === 'Escape') {
      setEditingLocation(null);
    }
  };

  const handleClick = (vehicleId: string) => {
    console.log("Grid view button clicked for vehicle:", vehicleId);
    onVehicleClick?.(vehicleId);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.id}
          className="overflow-hidden group hover:shadow-lg transition-shadow"
        >
          <div className="relative h-48 bg-muted">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url || `https://picsum.photos/seed/${vehicle.id}/800/400`}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            <Badge
              className="absolute top-2 right-2"
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
          </div>
          <CardContent className="mt-4">
            <h3 className="text-lg font-semibold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-muted-foreground">
              License: {vehicle.license_plate}
            </p>
            <div 
              className="text-sm text-muted-foreground mt-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={(e) => handleLocationClick(e, vehicle.id, vehicle.location)}
            >
              {editingLocation === vehicle.id ? (
                <Input
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, vehicle.id)}
                  onBlur={() => handleLocationUpdate(vehicle.id)}
                  autoFocus
                  className="w-full"
                  placeholder="Enter location"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vehicle.location || "Not available"}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleClick(vehicle.id)}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};