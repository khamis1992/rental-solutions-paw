import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleStats } from "@/components/vehicles/VehicleStats";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Car, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Vehicle } from "@/types/vehicle";
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

const Vehicles = () => {
  const { toast } = useToast();

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

  return (
    <DashboardLayout>
      <Card className="mb-6">
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
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Vehicle List</CardTitle>
          <CardDescription>
            View and manage all vehicles in your fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleList vehicles={vehicles} isLoading={isLoading} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Vehicles;