import { Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { performanceMetrics } from "@/services/performanceMonitoring";
import { useParams } from "react-router-dom";

// Lazy load components for better initial load performance
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const Customers = lazy(() => import("@/pages/Customers"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const Agreements = lazy(() => import("@/pages/Agreements"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const Help = lazy(() => import("@/pages/Help"));
const Legal = lazy(() => import("@/pages/Legal"));
const Finance = lazy(() => import("@/pages/Finance"));
const VehicleDetails = lazy(() => import("@/components/vehicles/VehicleDetails"));
const VehicleInspectionForm = lazy(() => import("@/components/maintenance/inspection/VehicleInspectionForm"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
  </div>
);

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
    // Enable comprehensive performance monitoring
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

    observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });

    // Set up comprehensive real-time data synchronization
    const tables = [
      'profiles',
      'leases',
      'vehicles',
      'payments',
      'maintenance',
      'traffic_fines',
      'expense_transactions',
      'document_analysis_logs'
    ];

    const channels = tables.map(table => 
      supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          (payload) => {
            console.log(`${table} change detected:`, payload);
            
            // Invalidate affected queries
            queryClient.invalidateQueries({ queryKey: [table] });
            
            // Show notification for important changes
            if (['payments', 'maintenance', 'traffic_fines'].includes(table)) {
              const eventType = payload.eventType;
              const message = `${table.replace('_', ' ')} ${eventType.toLowerCase()}d`;
              toast.info(message, {
                description: 'The data has been updated.'
              });
            }

            // Track performance impact
            performanceMetrics.trackPageLoad(
              window.location.pathname,
              performance.now()
            );
          }
        )
        .subscribe()
    );

    // Set up error tracking
    const errorChannel = supabase
      .channel('system-errors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'performance_metrics',
          filter: "metric_type=eq.'error'"
        },
        (payload: { new: any }) => {
          console.error('System error detected:', payload);
          toast.error('System error detected. Our team has been notified.');
          
          performanceMetrics.trackError({
            message: 'System error detected',
            stack: JSON.stringify(payload.new),
            context: payload.new?.context || {}
          });
        }
      )
      .subscribe();

    // Prefetch critical data
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['company_settings'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('company_settings')
            .select('*')
            .maybeSingle();
          if (error) throw error;
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ['user_preferences'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .maybeSingle();
          if (error) throw error;
          return data;
        },
      })
    ]).catch(console.error);

    return () => {
      observer.disconnect();
      channels.forEach(channel => supabase.removeChannel(channel));
      supabase.removeChannel(errorChannel);
    };
  }, [queryClient]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/customers" element={<Customers />} />
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
    </Suspense>
  );
}

export default App;