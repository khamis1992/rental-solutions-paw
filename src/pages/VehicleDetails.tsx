import { useParams } from "react-router-dom";
import { VehicleDetails as VehicleDetailsComponent } from "@/components/vehicles/VehicleDetails";

const VehicleDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <VehicleDetailsComponent />
    </div>
  );
};

export default VehicleDetailsPage;