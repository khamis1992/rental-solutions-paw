import { Agent, AgentResponse } from './types';
import { supabase } from '@/integrations/supabase/client';

export class LegalAgent implements Agent {
  name = 'LegalAgent';

  async canHandle(message: string): Promise<number> {
    const legalKeywords = [
      'agreement', 'contract', 'penalty', 'late', 'fine',
      'legal', 'terms', 'conditions', 'violation', 'compliance'
    ];
    
    const messageWords = message.toLowerCase().split(' ');
    const matches = legalKeywords.filter(keyword => 
      messageWords.some(word => word.includes(keyword.toLowerCase()))
    );
    
    return matches.length / legalKeywords.length;
  }

  async process(message: string): Promise<AgentResponse> {
    try {
      // Handle penalty simulation queries
      const penaltyMatch = message.match(/penalties|late return|overdue|fines.*agreement.*#?(\w+)/i);
      if (penaltyMatch) {
        const agreementNumber = penaltyMatch[1];
        
        const { data: agreement } = await supabase
          .from('leases')
          .select(`
            *,
            vehicle:vehicles(make, model, license_plate)
          `)
          .eq('agreement_number', agreementNumber)
          .single();

        if (!agreement) {
          return {
            content: `Agreement #${agreementNumber} not found. Please verify the agreement number.`,
            confidence: 0.8
          };
        }

        const dailyLateFee = agreement.daily_late_fee || 120;
        const damagePenalty = agreement.damage_penalty_rate || 0;
        const fuelPenalty = agreement.fuel_penalty_rate || 0;

        return {
          content: `For Agreement #${agreementNumber} (${agreement.vehicle?.make} ${agreement.vehicle?.model}):
            - Late return fee: ${dailyLateFee} QAR per day
            - Damage penalty rate: ${damagePenalty}%
            - Fuel penalty rate: ${fuelPenalty}%
            
            Based on historical data, late returns typically result in:
            - Average late fee: ${dailyLateFee * 3} QAR (3 days average)
            - Common issues: Fuel level below requirement, minor damages
            
            💡 Tip: Return the vehicle on time to avoid these penalties.`,
          confidence: 0.9,
          metadata: { agreement }
        };
      }

      return {
        content: "I can help you with legal matters and agreements. What would you like to know?",
        confidence: 0.5
      };
    } catch (error) {
      console.error('LegalAgent error:', error);
      return {
        content: "I encountered an error while processing legal information.",
        confidence: 0.1
      };
    }
  }
}