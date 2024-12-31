import { ReactNode } from 'react';

interface RouteWrapperProps {
  children: ReactNode;
}

export const RouteWrapper = ({ children }: RouteWrapperProps) => {
  return <div className="min-h-screen bg-background">{children}</div>;
};