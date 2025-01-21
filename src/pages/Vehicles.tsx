import { VehicleList } from "@/components/vehicles/VehicleList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useVehicles } from "@/hooks/use-vehicles";

const Vehicles = () => {
  const { data: vehicles, isLoading } = useVehicles();

  return (
    <DashboardLayout>
      <div className="w-full bg-background">
        <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <VehicleList vehicles={vehicles || []} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;