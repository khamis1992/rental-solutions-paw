import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleStats } from "@/components/vehicles/VehicleStats";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Car, Plus, AlertTriangle, Wrench } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Vehicles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Calculate stats
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const needsAttention = vehicles.filter(v => ['accident', 'police_station'].includes(v.status || '')).length;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Vehicle Management</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your fleet, track vehicle status, and monitor maintenance schedules
            </p>
          </div>
          <div className="flex gap-3">
            <CreateVehicleDialog>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            </CreateVehicleDialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Available Vehicles</p>
                  <p className="text-3xl font-bold">{availableVehicles}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Car className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">In Maintenance</p>
                  <p className="text-3xl font-bold">{maintenanceVehicles}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Wrench className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Needs Attention</p>
                  <p className="text-3xl font-bold">{needsAttention}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle List Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Vehicle List</h2>
              <p className="text-muted-foreground">
                View and manage all vehicles in your fleet
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">In Maintenance</SelectItem>
                  <SelectItem value="attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <VehicleList 
              vehicles={filteredVehicles} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;