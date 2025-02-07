
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleStats } from "@/components/vehicles/VehicleStats";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Car, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Vehicles = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select();

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      return (data || []) as Vehicle[];
    },
  });

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      vehicle.make?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.license_plate?.toLowerCase().includes(searchLower) ||
      vehicle.vin?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 backdrop-blur-sm border border-white/10">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold">Vehicle Management</h1>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
                  Manage your fleet, track vehicle status, and monitor maintenance schedules efficiently
                </p>
              </div>
              <div className="flex gap-3">
                <CreateVehicleDialog>
                  <Button className="flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center">
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                  </Button>
                </CreateVehicleDialog>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl rounded-full transform translate-x-16 translate-y-16" />
        </div>

        {/* Enhanced Stats Section */}
        <VehicleStats vehicles={vehicles} isLoading={isLoading} />

        {/* Enhanced Vehicle List Section */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Vehicle List</h2>
                  <p className="text-muted-foreground text-sm">
                    View and manage all vehicles in your fleet
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vehicles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <VehicleList 
                vehicles={filteredVehicles} 
                isLoading={isLoading} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
