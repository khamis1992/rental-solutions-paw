import { useParams } from "react-router-dom";
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
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold mb-4">Vehicle ID is required</h2>
        <Button onClick={() => navigate("/vehicles")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicles
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold mb-4">Vehicle not found</h2>
        <Button onClick={() => navigate("/vehicles")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/vehicles")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicles
        </Button>
        <h1 className="text-2xl font-bold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
      </div>

      <DocumentExpiryNotifications vehicleId={id} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <VehicleOverview vehicleId={id} />
        <VehicleQRCode 
          make={vehicle.make} 
          model={vehicle.model}
          vehicleId={id}
        />
      </div>

      <VehicleStatus 
        vehicleId={id} 
        currentStatus={vehicle.status} 
      />

      <VehicleInsurance vehicleId={id} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <VehicleDocuments vehicleId={id} />
        <MaintenanceHistory vehicleId={id} />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <DamageHistory vehicleId={id} />
        <VehicleTimeline vehicleId={id} />
      </div>
    </div>
  );
};