import { createBrowserRouter } from "react-router-dom";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Customers from "@/pages/Customers";
import CustomerProfile from "@/pages/CustomerProfile";
import Vehicles from "@/pages/Vehicles";
import Agreements from "@/pages/Agreements";
import Maintenance from "@/pages/Maintenance";
import TrafficFines from "@/pages/TrafficFines";
import Reports from "@/pages/Reports";
import Finance from "@/pages/Finance";
import Legal from "@/pages/Legal";
import Help from "@/pages/Help";
import Settings from "@/pages/Settings";
import Audit from "@/pages/Audit";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RouteWrapper><Index /></RouteWrapper>
  },
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/customers",
    element: <RouteWrapper><Customers /></RouteWrapper>
  },
  {
    path: "/customers/:id",
    element: <RouteWrapper><CustomerProfile /></RouteWrapper>
  },
  {
    path: "/vehicles",
    element: <RouteWrapper><Vehicles /></RouteWrapper>
  },
  {
    path: "/agreements",
    element: <RouteWrapper><Agreements /></RouteWrapper>
  },
  {
    path: "/maintenance",
    element: <RouteWrapper><Maintenance /></RouteWrapper>
  },
  {
    path: "/traffic-fines",
    element: <RouteWrapper><TrafficFines /></RouteWrapper>
  },
  {
    path: "/reports",
    element: <RouteWrapper><Reports /></RouteWrapper>
  },
  {
    path: "/finance",
    element: <RouteWrapper><Finance /></RouteWrapper>
  },
  {
    path: "/legal",
    element: <RouteWrapper><Legal /></RouteWrapper>
  },
  {
    path: "/help",
    element: <RouteWrapper><Help /></RouteWrapper>
  },
  {
    path: "/settings",
    element: <RouteWrapper><Settings /></RouteWrapper>
  },
  {
    path: "/audit",
    element: <RouteWrapper><Audit /></RouteWrapper>
  }
]);