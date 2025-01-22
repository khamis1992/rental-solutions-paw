import { useParams } from "react-router-dom";
import { VehicleOverview } from "./profile/VehicleOverview";
import { VehicleDocuments } from "./profile/VehicleDocuments";
import { MaintenanceHistory } from "./profile/MaintenanceHistory";
import { DamageHistory } from "./profile/DamageHistory";
import { VehicleTimeline } from "./profile/VehicleTimeline";
import { VehicleQRCode } from "./profile/VehicleQRCode";
import { VehicleInsurance } from "./profile/VehicleInsurance";
import { DocumentExpiryNotifications } from "./profile/DocumentExpiryNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: vehicle } = useQuery({
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

  if (!id) return null;

  return (
    <div className="space-y-6">
      <DocumentExpiryNotifications vehicleId={id} />
      <div className="grid gap-6 md:grid-cols-2">
        <VehicleOverview vehicleId={id} />
        {vehicle && (
          <VehicleQRCode 
            make={vehicle.make} 
            model={vehicle.model}
            vehicleId={id}
          />
        )}
      </div>
      <VehicleInsurance vehicleId={id} />
      <VehicleDocuments vehicleId={id} />
      <MaintenanceHistory vehicleId={id} />
      <DamageHistory vehicleId={id} />
      <VehicleTimeline vehicleId={id} />
    </div>
  );
};