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
      } as PerformanceMetric);
    
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
      } as PerformanceMetric);
    
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
      } as PerformanceMetric);
    
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
      .eq('id', insightId);
    
    if (error) throw error;
    return data;
  }
};