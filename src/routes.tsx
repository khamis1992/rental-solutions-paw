import { createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Vehicles from "@/pages/Vehicles";
import Customers from "@/pages/Customers";
import Agreements from "@/pages/Agreements";
import CustomerProfile from "@/pages/CustomerProfile";
import Maintenance from "@/pages/Maintenance";
import TrafficFines from "@/pages/TrafficFines";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import Legal from "@/pages/Legal";
import Help from "@/pages/Help";
import Settings from "@/pages/Settings";
import Audit from "@/pages/Audit";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/vehicles",
    element: <Vehicles />,
  },
  {
    path: "/customers",
    element: <Customers />,
  },
  {
    path: "/agreements",
    element: <Agreements />,
  },
  {
    path: "/customer/:id",
    element: <CustomerProfile />,
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
    path: "/reports",
    element: <Reports />,
  },
  {
    path: "/legal",
    element: <Legal />,
  },
  {
    path: "/help",
    element: <Help />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/audit",
    element: <Audit />,
  },
]);