import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleStats } from "@/components/vehicles/VehicleStats";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Car, Plus, FileQuestion } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Filters {
  status: VehicleStatus | "all";
  searchQuery: string;
}

const Vehicles = () => {
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    searchQuery: "",
  });
  const { toast } = useToast();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      console.log("Current filters:", filters);

      let query = supabase.from("vehicles").select();

      if (filters.status !== "all") {
        console.log("Filtering by status:", filters.status);
        query = query.eq("status", filters.status);
      }

      if (filters.searchQuery) {
        console.log("Searching for:", filters.searchQuery);
        query = query.or(
          `make.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%,license_plate.ilike.%${filters.searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      console.log("Raw Supabase response:", data);
      
      return (data || []) as Vehicle[];
    },
  });

  const handleExportToExcel = async () => {
    try {
      if (!vehicles.length) {
        toast({
          title: "No data to export",
          description: "There are no vehicles to export to Excel.",
          variant: "destructive",
        });
        return;
      }

      const headers = ["Make", "Model", "Year", "License Plate", "VIN", "Status", "Mileage"];
      const csvContent = [
        headers.join(","),
        ...vehicles.map(vehicle => [
          vehicle.make,
          vehicle.model,
          vehicle.year,
          vehicle.license_plate,
          vehicle.vin,
          vehicle.status,
          vehicle.mileage
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "vehicles.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: "The vehicles data has been exported to Excel format.",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the vehicles data.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Car className="h-8 w-8 text-primary" />
                  Vehicle Management
                </CardTitle>
                <CardDescription className="mt-2">
                  Manage your fleet, track vehicle status, and monitor maintenance schedules
                </CardDescription>
              </div>
              <div className="flex gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleExportToExcel}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export vehicle data to Excel</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CreateVehicleDialog>
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Vehicle
                        </Button>
                      </CreateVehicleDialog>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a new vehicle to the fleet</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
        </Card>

        <VehicleStats vehicles={vehicles} isLoading={isLoading} />
        
        <Card>
          <CardContent className="pt-6">
            <VehicleFilters filters={filters} setFilters={setFilters as (filters: Filters) => void} />
            <VehicleList vehicles={vehicles} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
