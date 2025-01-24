import { Agent, AgentResponse } from './types';
import { supabase } from '@/integrations/supabase/client';

export class VehicleAgent implements Agent {
  name = 'VehicleAgent';

  async canHandle(message: string): Promise<number> {
    const vehicleKeywords = [
      'vehicle', 'car', 'maintenance', 'available', 'rent',
      'license plate', 'model', 'make', 'year'
    ];
    
    const messageWords = message.toLowerCase().split(' ');
    const matches = vehicleKeywords.filter(keyword => 
      messageWords.some(word => word.includes(keyword.toLowerCase()))
    );
    
    return matches.length / vehicleKeywords.length;
  }

  async process(message: string): Promise<AgentResponse> {
    try {
      if (message.match(/available|free|rent/i)) {
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'available')
          .limit(5);

        if (!vehicles?.length) {
          return {
            content: "No vehicles are currently available.",
            confidence: 0.8
          };
        }

        return {
          content: `Available vehicles:\n${vehicles.map(v => 
            `- ${v.make} ${v.model} (${v.year}) - ${v.license_plate}`
          ).join('\n')}`,
          confidence: 0.9,
          metadata: { vehicles }
        };
      }

      return {
        content: "I can help you with vehicle information. What would you like to know?",
        confidence: 0.5
      };
    } catch (error) {
      console.error('VehicleAgent error:', error);
      return {
        content: "I encountered an error while fetching vehicle information.",
        confidence: 0.1
      };
    }
  }
}