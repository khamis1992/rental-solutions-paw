import { supabase } from "@/integrations/supabase/client";

export const performanceMetrics = {
  async trackPageLoad(route: string, loadTime: number) {
    return supabase
      .from('performance_metrics')
      .insert({
        metric_type: 'page_load',
        value: loadTime,
        context: { route }
      });
  },

  async trackApiCall(endpoint: string, duration: number, success: boolean) {
    return supabase
      .from('performance_metrics')
      .insert({
        metric_type: 'api_call',
        value: duration,
        context: { endpoint, success }
      });
  },

  async trackUserInteraction(action: string, duration: number) {
    return supabase
      .from('performance_metrics')
      .insert({
        metric_type: 'user_interaction',
        value: duration,
        context: { action }
      });
  }
};

export const aiAnalysis = {
  async getInsights() {
    const { data } = await supabase
      .from('ai_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    return data;
  },

  async triggerAnalysis() {
    return supabase.functions.invoke('analyze-performance');
  },

  async markInsightImplemented(insightId: string) {
    return supabase
      .from('ai_insights')
      .update({
        status: 'implemented',
        implemented_at: new Date().toISOString()
      })
      .eq('id', insightId);
  }
};