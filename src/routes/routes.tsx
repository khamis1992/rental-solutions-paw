import { lazy, LazyExoticComponent, ComponentType } from "react";

interface RouteComponent {
  [key: string]: LazyExoticComponent<ComponentType<any>>;
}

const routes: RouteComponent = {
  Auth: lazy(() => import("@/pages/Auth")),
  Dashboard: lazy(() => import("@/pages/Index")),
  Vehicles: lazy(() => import("@/pages/Vehicles")),
  VehicleDetails: lazy(() => import("@/components/vehicles/VehicleDetails")),
  Customers: lazy(() => import("@/pages/Customers")),
  CustomerProfile: lazy(() => import("@/pages/CustomerProfile")),
  Agreements: lazy(() => import("@/pages/Agreements")),
  Settings: lazy(() => import("@/pages/Settings")),
  Maintenance: lazy(() => import("@/pages/Maintenance")),
  TrafficFines: lazy(() => import("@/pages/TrafficFines")),
  Reports: lazy(() => import("@/pages/Reports")),
  Finance: lazy(() => import("@/pages/Finance")),
  Help: lazy(() => import("@/pages/Help")),
  Legal: lazy(() => import("@/pages/Legal")),
  Audit: lazy(() => import("@/pages/Audit")),
  RemainingAmount: lazy(() => import("@/pages/RemainingAmount"))
};

export const {
  Auth,
  Dashboard,
  Vehicles,
  VehicleDetails,
  Customers,
  CustomerProfile,
  Agreements,
  Settings,
  Maintenance,
  TrafficFines,
  Reports,
  Finance,
  Help,
  Legal,
  Audit,
  RemainingAmount
} = routes;