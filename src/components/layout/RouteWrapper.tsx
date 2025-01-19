import { ReactNode } from "react";

interface RouteWrapperProps {
  children?: ReactNode;
}

export const RouteWrapper = ({ children }: RouteWrapperProps) => {
  return <>{children}</>;
};