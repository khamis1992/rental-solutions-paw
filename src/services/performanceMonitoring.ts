import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PerformanceMetric = Database["public"]["Tables"]["performance_metrics"]["Row"];
type AIInsight = Database["public"]["Tables"]["ai_insights"]["Row"];

export const performanceMetrics = {
  async trackPageLoad(route: string, loadTime: number) {
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
  },

  async trackCPUUtilization(cpuUsage: number) {
    const { data, error } = await supabase
      .from("performance_metrics")
      .insert({
        metric_type: 'cpu',
        value: cpuUsage,
        cpu_utilization: cpuUsage,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async trackDiskIO() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const { quota = 0, usage = 0 } = estimate;
        const usagePercentage = (usage / quota) * 100;

        const { data, error } = await supabase
          .from("performance_metrics")
          .insert({
            metric_type: 'disk_io',
            value: usagePercentage,
            context: {
              quota,
              usage,
              availableSpace: quota - usage,
            },
            timestamp: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error tracking disk I/O:', error);
        throw error;
      }
    }
    return null;
  },

  async trackError(error: { component: string; error: any; timestamp: string }) {
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
  }
};

export const aiAnalysis = {
  async getInsights() {
    const { data, error } = await supabase
      .from("ai_insights")
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data as AIInsight[];
  },

  async triggerAnalysis() {
    const { data, error } = await supabase.functions.invoke(
      'analyze-performance',
      {
        body: { includesDiskMetrics: true },
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (error) throw error;
    return data;
  },

  async markInsightImplemented(insightId: string) {
    const { data, error } = await supabase
      .from("ai_insights")
      .update({
        status: 'implemented',
        implemented_at: new Date().toISOString()
      })
      .eq('id', insightId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};