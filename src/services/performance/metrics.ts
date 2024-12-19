import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { metricsCache } from './cache';
import { ExtendedPerformance } from './types';
import { 
  RESPONSE_TIME_THRESHOLD, 
  ERROR_RATE_THRESHOLD,
  CPU_THRESHOLD,
  MEMORY_THRESHOLD 
} from './constants';

export const performanceMetrics = {
  async trackPageLoad(route: string, loadTime: number) {
    if (loadTime > RESPONSE_TIME_THRESHOLD) {
      toast.warning("Slow page load detected", {
        description: `Page ${route} took ${(loadTime / 1000).toFixed(1)}s to load`
      });
    }

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
    const recentErrors = await this.getRecentErrors();
    const errorRate = recentErrors.length / 100;

    if (errorRate > ERROR_RATE_THRESHOLD) {
      toast.error("High error rate detected", {
        description: "System is experiencing higher than normal error rates"
      });
    }

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

  async getRecentErrors() {
    const cached = metricsCache.get<any[]>('recent-errors');
    if (cached) return cached;

    const { data, error } = await supabase
      .from("performance_metrics")
      .select()
      .eq('metric_type', 'error')
      .gte('timestamp', new Date(Date.now() - 3600000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    const result = data || [];
    metricsCache.set('recent-errors', result);
    return result;
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

    if (cpuUsage > CPU_THRESHOLD) {
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

      if (memoryUsage > MEMORY_THRESHOLD) {
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