import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
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
import Finance from "@/pages/Finance";
import { VehicleDetails } from "@/components/vehicles/VehicleDetails";
import { VehicleInspectionForm } from "@/components/maintenance/inspection/VehicleInspectionForm";
import { useParams } from "react-router-dom";
import { performanceMetrics } from "@/services/performanceMonitoring";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Wrapper components to handle URL parameters
const VehicleDetailsWrapper = () => {
  const { id } = useParams();
  if (!id) return <div>Vehicle ID not found</div>;
  return <VehicleDetails vehicleId={id} />;
};

const VehicleInspectionWrapper = () => {
  const { id } = useParams();
  if (!id) return <div>Maintenance ID not found</div>;
  return <VehicleInspectionForm maintenanceId={id} />;
};

function App() {
  const queryClient = useQueryClient();

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

    // Set up real-time error tracking and data synchronization
    const channel = supabase
      .channel('system-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'performance_metrics',
          filter: "metric_type=eq.'error'"
        },
        (payload) => {
          console.error('System error detected:', payload);
          toast.error('System error detected. Our team has been notified.');
          
          // Log error to performance metrics
          performanceMetrics.trackError({
            component: 'system',
            error: payload.new,
            timestamp: new Date().toISOString()
          });

          // Invalidate affected queries
          queryClient.invalidateQueries();
        }
      )
      .subscribe();

    // Prefetch critical data
    queryClient.prefetchQuery({
      queryKey: ['company_settings'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .single();
        if (error) throw error;
        return data;
      },
    });

    return () => {
      observer.disconnect();
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
      <Route path="/maintenance/:id/inspection" element={<VehicleInspectionWrapper />} />
      <Route path="/finance" element={<Finance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
      <Route path="/legal" element={<Legal />} />
    </Routes>
  );
}

export default App;