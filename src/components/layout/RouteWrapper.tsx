import { ReactNode } from "react";
import { DashboardLayout } from "./DashboardLayout";

interface RouteWrapperProps {
  children: ReactNode;
}

export const RouteWrapper = ({ children }: RouteWrapperProps) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};