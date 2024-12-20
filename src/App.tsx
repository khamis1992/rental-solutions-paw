import { Routes, Route, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";

// Lazy load all pages
const Index = lazy(() => import("@/pages/Index"));
const Agreements = lazy(() => import("@/pages/Agreements"));
const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
const Customers = lazy(() => import("@/pages/Customers"));
const Finance = lazy(() => import("@/pages/Finance"));
const Help = lazy(() => import("@/pages/Help"));
const Legal = lazy(() => import("@/pages/Legal"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const TrafficFines = lazy(() => import("@/pages/TrafficFines"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={
          <DashboardLayout>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </DashboardLayout>
        }>
          <Route path="/" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Index />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/agreements" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Agreements />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/customers" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Customers />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/customer/:id" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <CustomerProfile />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/finance" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Finance />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/help" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Help />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/legal" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Legal />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/maintenance" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Maintenance />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/reports" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Reports />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/settings" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Settings />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/traffic-fines" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <TrafficFines />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/vehicles" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Vehicles />
              </Suspense>
            </ErrorBoundary>
          } />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}