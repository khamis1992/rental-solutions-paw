import { Navigate } from "react-router-dom";
import VehicleDetailsPage from "@/pages/VehicleDetails";
import VehiclesPage from "@/pages/Vehicles";
import MobileVehicleDetailsPage from "@/pages/MobileVehicleDetails";

export const routes = [
  {
    path: "/vehicles",
    element: <VehiclesPage />
  },
  {
    path: "/vehicles/:id",
    element: <VehicleDetailsPage />
  },
  {
    path: "/m/vehicles/:id",
    element: <MobileVehicleDetailsPage />
  },
  {
    path: "*",
    element: <Navigate to="/vehicles" />
  }
];
