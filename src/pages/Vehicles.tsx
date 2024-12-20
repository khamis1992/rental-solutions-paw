import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleStats } from "@/components/vehicles/VehicleStats";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Vehicles = () => {
  const [filters, setFilters] = useState({
    status: "all",
    searchQuery: "",
  });
  const { toast } = useToast();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      console.log("Current filters:", filters);

      let query = supabase.from("vehicles").select("*");

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
      
      return data || [];
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

      // Convert vehicles data to CSV format
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

      // Create blob and download
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

  console.log("Vehicles being rendered:", vehicles);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <div className="flex gap-4">
          <Button
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 py-2.5 rounded-lg"
            onClick={handleExportToExcel}
          >
            <Download className="mr-2 h-4 w-4" />
            Export To Excel
          </Button>
          <CreateVehicleDialog />
        </div>
      </div>
      <VehicleStats vehicles={vehicles} isLoading={isLoading} />
      <div className="mt-6 space-y-4">
        <VehicleFilters filters={filters} setFilters={setFilters} />
        <VehicleList vehicles={vehicles} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;