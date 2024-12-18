import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleOverview } from "./profile/VehicleOverview";
import { MaintenanceHistory } from "./profile/MaintenanceHistory";
import { DamageHistory } from "./profile/DamageHistory";
import { AssociatedAgreements } from "./profile/AssociatedAgreements";
import { VehicleDocuments } from "./profile/VehicleDocuments";

interface VehicleDetailsProps {
  vehicleId: string;
}

export const VehicleDetails = ({ vehicleId }: VehicleDetailsProps) => {
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Image */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-muted">
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
      </div>

      {/* Vehicle Information Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="damages">Damages</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <VehicleOverview vehicle={vehicle} />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <MaintenanceHistory vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="damages" className="mt-6">
          <DamageHistory vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="agreements" className="mt-6">
          <AssociatedAgreements vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <VehicleDocuments vehicleId={vehicleId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};