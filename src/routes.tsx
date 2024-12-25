import { RouteObject } from "react-router-dom";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import Agreements from "./pages/Agreements";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Finance from "./pages/Finance";
import Legal from "./pages/Legal";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import Audit from "./pages/Audit";

export const routes: RouteObject[] = [
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
    path: "/customers/:id",
    element: <CustomerProfile />,
  },
  {
    path: "/agreements",
    element: <Agreements />,
  },
  {
    path: "/maintenance",
    element: <Maintenance />,
  },
  {
    path: "/reports",
    element: <Reports />,
  },
  {
    path: "/finance",
    element: <Finance />,
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
];