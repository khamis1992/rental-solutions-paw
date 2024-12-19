import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

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

    // Alert if CPU usage is high
    if (cpuUsage > 80) {
      toast.warning("High CPU Usage", {
        description: `Current CPU utilization is ${cpuUsage.toFixed(1)}%`
      });
    }

    if (error) throw error;
    return data;
  },

  async trackMemoryUsage() {
    const performance = window.performance as ExtendedPerformance;
    
    if (performance.memory) {
      const usedMemory = performance.memory.usedJSHeapSize;
      const totalMemory = performance.memory.totalJSHeapSize;
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

      // Alert if memory usage is high
      if (memoryUsage > 80) {
        toast.warning("High Memory Usage", {
          description: `Memory utilization is at ${memoryUsage.toFixed(1)}%`
        });
      }

      if (error) throw error;
      return data;
    }
    return null;
  },

  async trackDiskIO() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
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
    }
    return null;
  },

  async triggerAnalysis() {
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
    return data;
  },

  async triggerAnalysis() {
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