
import { useParams, useNavigate } from "react-router-dom";
import { VehicleOverview } from "./profile/VehicleOverview";
import { VehicleDocuments } from "./profile/VehicleDocuments";
import { MaintenanceHistory } from "./profile/MaintenanceHistory";
import { DamageHistory } from "./profile/DamageHistory";
import { VehicleTimeline } from "./profile/VehicleTimeline";
import { VehicleQRCode } from "./profile/VehicleQRCode";
import { VehicleInsurance } from "./profile/VehicleInsurance";
import { VehicleStatus } from "./profile/VehicleStatus";
import { DocumentExpiryNotifications } from "./profile/DocumentExpiryNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Car, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (!id) {
    return (
      <Card className="mx-auto max-w-lg mt-8">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Vehicle ID is required</h2>
          <Button onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px] rounded-lg" />
          <Skeleton className="h-[200px] rounded-lg" />
        </div>
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <Card className="mx-auto max-w-lg mt-8">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Vehicle not found</h2>
          <Button onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background-alt rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/vehicles")}
            className="shrink-0 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8 text-primary animate-fade-in" />
            <h1 className="text-2xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-help">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {vehicle.license_plate}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Vehicle License Plate
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-background rounded-lg shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
          <VehicleQRCode 
            make={vehicle.make} 
            model={vehicle.model}
            vehicleId={id}
            year={vehicle.year}
            licensePlate={vehicle.license_plate}
            vin={vehicle.vin}
          />
        </div>
        <div className="bg-background rounded-lg shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
          <VehicleStatus 
            vehicleId={id} 
            currentStatus={vehicle.status} 
          />
        </div>
      </div>

      <div className="bg-background-alt rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
        <DocumentExpiryNotifications vehicleId={id} />
      </div>
      
      <div className="bg-background rounded-lg shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
        <VehicleOverview vehicleId={id} />
      </div>

      <div className="bg-background rounded-lg shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
        <VehicleInsurance vehicleId={id} />
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-background rounded-lg shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
          <VehicleDocuments vehicleId={id} />
        </div>
        <div className="bg-background rounded-lg shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
          <MaintenanceHistory vehicleId={id} />
        </div>
      </div>

      <div className="bg-background rounded-lg shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
        <DamageHistory vehicleId={id} />
      </div>

      <div className="bg-background rounded-lg shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
        <VehicleTimeline vehicleId={id} />
      </div>
    </div>
  );
};
