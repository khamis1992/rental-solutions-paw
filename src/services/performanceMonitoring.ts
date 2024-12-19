import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

const RESPONSE_TIME_THRESHOLD = 3000; // 3 seconds
const ERROR_RATE_THRESHOLD = 0.05; // 5%
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize cache
const metricsCache = new Map<string, { data: any; timestamp: number }>();

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
    // Calculate current error rate
    const recentErrors = await this.getRecentErrors();
    const errorRate = recentErrors.length / 100; // Assuming 100 total operations

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
    const cacheKey = 'recent-errors';
    const cached = metricsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from("performance_metrics")
      .select()
      .eq('metric_type', 'error')
      .gte('timestamp', new Date(Date.now() - 3600000).toISOString()) // Last hour
      .order('timestamp', { ascending: false });

    if (error) throw error;

    metricsCache.set(cacheKey, {
      data: data || [],
      timestamp: Date.now()
    });

    return data || [];
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
      },
      { count: 'exact' }
    );
    
    if (error) throw error;
    return data;
  }
};

export const aiAnalysis = {
  async getInsights() {
    const cacheKey = 'ai-insights';
    const cached = metricsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from("ai_insights")
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;

    metricsCache.set(cacheKey, {
      data: data || [],
      timestamp: Date.now()
    });

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
      },
      { count: 'exact' }
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