import { useParams } from "react-router-dom";
import { VehicleDetails as VehicleDetailsComponent } from "@/components/vehicles/VehicleDetails";

const VehicleDetails = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <VehicleDetailsComponent vehicleId={id!} />
    </div>
  );
};

export default VehicleDetails;