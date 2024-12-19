import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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
      return null;
    }
  },

  async trackError(error: { message: string; stack?: string; context?: any }) {
    try {
      const { data, error } = await supabase
        .from("performance_metrics")
        .insert({
          metric_type: 'error',
          value: 1,
          context: error,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to track error:', error);
      return null;
    }
  },

  async trackCPUUtilization(cpuUsage: number) {
    try {
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
    } catch (error) {
      console.error('Failed to track CPU utilization:', error);
      return null;
    }
  },

  async trackMemoryUsage() {
    try {
      const memory = (performance as any).memory;
      if (memory) {
        const usedMemory = memory.usedJSHeapSize;
        const totalMemory = memory.totalJSHeapSize;
        const memoryUsage = (usedMemory / totalMemory) * 100;

        const { data, error } = await supabase
          .from("performance_metrics")
          .insert({
            metric_type: 'memory',
            value: memoryUsage,
            context: {
              usedMemory,
              totalMemory,
              timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to track memory usage:', error);
      return null;
    }
  },

  async trackDiskIO() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
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
      }
      return null;
    } catch (error) {
      console.error('Failed to track disk I/O:', error);
      return null;
    }
  }
};

export const aiAnalysis = {
  async getInsights() {
    try {
      const { data, error } = await supabase
        .from("ai_insights")
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      return [];
    }
  },

  async triggerAnalysis() {
    try {
      const { data, error } = await supabase.functions.invoke(
        'analyze-performance',
        {
          body: { includesDiskMetrics: true },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to trigger analysis:', error);
      throw error;
    }
  },

  async markInsightImplemented(insightId: string) {
    try {
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
    } catch (error) {
      console.error('Failed to mark insight as implemented:', error);
      throw error;
    }
  }
};