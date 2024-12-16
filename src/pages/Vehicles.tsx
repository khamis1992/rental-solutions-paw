import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleStats } from "@/components/vehicles/VehicleStats";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";

const Vehicles = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <CreateVehicleDialog />
      </div>
      <VehicleStats />
      <div className="mt-6 space-y-4">
        <VehicleFilters />
        <VehicleList />
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;