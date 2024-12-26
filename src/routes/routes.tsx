import { Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Agreements from "@/pages/Agreements";
import Customers from "@/pages/Customers";
import Vehicles from "@/pages/Vehicles";
import Maintenance from "@/pages/Maintenance";
import TrafficFines from "@/pages/TrafficFines";
import Finance from "@/pages/Finance";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import RemainingAmount from "@/pages/RemainingAmount";

export const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/agreements",
    element: <Agreements />,
  },
  {
    path: "/customers",
    element: <Customers />,
  },
  {
    path: "/vehicles",
    element: <Vehicles />,
  },
  {
    path: "/maintenance",
    element: <Maintenance />,
  },
  {
    path: "/traffic-fines",
    element: <TrafficFines />,
  },
  {
    path: "/finance",
    element: <Finance />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/help",
    element: <Help />,
  },
  {
    path: "/remaining-amount",
    element: <RemainingAmount />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];