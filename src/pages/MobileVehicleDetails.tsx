import { useParams } from "react-router-dom";
import { MobileVehicleDetails } from "@/components/vehicles/mobile/MobileVehicleDetails";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MobileVehicleDetailsPage = () => {
  const { id } = useParams();

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

  if (!vehicle) {
    return <div className="p-4">Vehicle not found</div>;
  }

  return (
    <MobileVehicleDetails
      vehicleId={vehicle.id}
      make={vehicle.make}
      model={vehicle.model}
      year={vehicle.year}
      licensePlate={vehicle.license_plate}
      vin={vehicle.vin}
    />
  );
};

export default MobileVehicleDetailsPage;