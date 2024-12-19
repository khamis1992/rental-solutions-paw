import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type PerformanceMetric = Database["public"]["Tables"]["performance_metrics"]["Row"];
type AIInsight = Database["public"]["Tables"]["ai_insights"]["Row"];

const CPU_ALERT_THRESHOLD = 80; // 80% CPU threshold
const CPU_CHECK_INTERVAL = 5000; // Check every 5 seconds
let lastAlertTime = 0;
const ALERT_COOLDOWN = 300000; // 5 minutes between alerts

const getCPUUsage = async (): Promise<number> => {
  try {
    // Use Performance API to get CPU metrics
    // This is a simplified version - in production you might want to use more sophisticated metrics
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endTime = performance.now();
    const timeDiff = endTime - startTime;
    
    // Calculate a rough CPU usage estimate (this is simplified)
    const usage = Math.min((timeDiff / 100) * 100, 100);
    return Number(usage.toFixed(2));
  } catch (error) {
    console.error('Error getting CPU usage:', error);
    return 0;
  }
};

const checkCPUAlert = (usage: number) => {
  const now = Date.now();
  if (usage > CPU_ALERT_THRESHOLD && (now - lastAlertTime) > ALERT_COOLDOWN) {
    toast({
      title: "High CPU Usage Alert",
      description: `CPU usage is at ${usage}%, exceeding the ${CPU_ALERT_THRESHOLD}% threshold.`,
      variant: "destructive",
    });
    lastAlertTime = now;
  }
};

export const performanceMetrics = {
  startCPUMonitoring: () => {
    const monitorCPU = async () => {
      const usage = await getCPUUsage();
      
      const { error } = await supabase
        .from("performance_metrics")
        .insert({
          metric_type: 'cpu_utilization',
          value: usage,
          cpu_utilization: usage,
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error logging CPU metrics:', error);
      }
      
      checkCPUAlert(usage);
    };

    // Start monitoring
    monitorCPU();
    const intervalId = setInterval(monitorCPU, CPU_CHECK_INTERVAL);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  },

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

  async trackApiCall(endpoint: string, duration: number, success: boolean) {
    const { data, error } = await supabase
      .from("performance_metrics")
      .insert({
        metric_type: 'api_call',
        value: duration,
        context: { endpoint, success },
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async trackUserInteraction(action: string, duration: number) {
    const { data, error } = await supabase
      .from("performance_metrics")
      .insert({
        metric_type: 'user_interaction',
        value: duration,
        context: { action },
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
    return supabase.functions.invoke('analyze-performance');
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