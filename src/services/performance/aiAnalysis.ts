import { supabase } from "@/integrations/supabase/client";
import { metricsCache } from './cache';

export const aiAnalysis = {
  async getInsights() {
    const cached = metricsCache.get<any[]>('ai-insights');
    if (cached) return cached;

    const { data, error } = await supabase
      .from("ai_insights")
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;

    const result = data || [];
    metricsCache.set('ai-insights', result);
    return result;
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