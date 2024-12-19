import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const performanceMetrics = {
  async trackPageLoad(route: string, loadTime: number) {
    try {
      const { data, error } = await supabase
        .from("performance_metrics")
        .insert({
          metric_type: 'page_load',
          value: loadTime,
          context: { route },
          timestamp: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to track page load:', error);
      // Don't show error toast to users for performance tracking
      return null;
    }
  },

  async trackError(error: { component: string; error: any; timestamp: string }) {
    try {
      const { data, error: dbError } = await supabase
        .from("performance_metrics")
        .insert({
          metric_type: 'error',
          value: 1,
          context: error,
          timestamp: error.timestamp
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      return data;
    } catch (err) {
      console.error('Failed to track error:', err);
      return null;
    }
  }
};