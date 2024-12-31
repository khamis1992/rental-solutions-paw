import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    const logPerformanceMetric = async (metricType: string, value: number) => {
      try {
        const { error } = await supabase
          .from('performance_metrics')
          .insert([
            {
              metric_type: metricType,
              value: value,
              context: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
              }
            }
          ]);

        if (error) {
          console.error('Failed to log performance metric:', error);
        }
      } catch (err) {
        console.error('Error logging performance metric:', err);
      }
    };

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      logPerformanceMetric('page_load', navigationTiming.loadEventEnd - navigationTiming.startTime);
    });

    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const end = performance.now();
        const duration = end - start;
        
        if (args[0] && typeof args[0] === 'string' && args[0].includes('supabase')) {
          console.log(`API call to ${args[0]} took ${duration}ms`);
          logPerformanceMetric('api_response_time', duration);
        }
        
        return response;
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);
};