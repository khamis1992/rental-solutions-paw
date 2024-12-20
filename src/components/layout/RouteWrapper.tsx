import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

interface RouteWrapperProps {
  children: React.ReactNode;
}

const LoadingSpinner = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export const RouteWrapper = ({ children }: RouteWrapperProps) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};