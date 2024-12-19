import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Customers from "@/pages/Customers";
import Vehicles from "@/pages/Vehicles";
import Agreements from "@/pages/Agreements";
import Maintenance from "@/pages/Maintenance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import CustomerProfile from "@/pages/CustomerProfile";
import Legal from "@/pages/Legal";
import { VehicleDetails } from "@/components/vehicles/VehicleDetails";
import { useParams } from "react-router-dom";
import { performanceMetrics } from "@/services/performanceMonitoring";

// Wrapper component to handle URL parameters
const VehicleDetailsWrapper = () => {
  const { id } = useParams();
  if (!id) return <div>Vehicle ID not found</div>;
  return <VehicleDetails vehicleId={id} />;
};

function App() {
  useEffect(() => {
    // Track initial page load
    const startTime = performance.now();
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      performanceMetrics.trackPageLoad(window.location.pathname, loadTime);
    });

    // Track navigation performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          performanceMetrics.trackPageLoad(
            window.location.pathname,
            entry.duration
          );
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerProfile />} />
      <Route path="/vehicles" element={<Vehicles />} />
      <Route path="/vehicles/:id" element={<VehicleDetailsWrapper />} />
      <Route path="/agreements" element={<Agreements />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
      <Route path="/legal" element={<Legal />} />
    </Routes>
  );
}

export default App;