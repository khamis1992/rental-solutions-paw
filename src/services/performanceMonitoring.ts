import { supabase } from "@/integrations/supabase/client";

export const performanceMetrics = {
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

  async triggerAnalysis() {
    return supabase.functions.invoke('analyze-performance', {
      body: { includesDiskMetrics: true },
      headers: { 'Content-Type': 'application/json' }
    });
  },
};