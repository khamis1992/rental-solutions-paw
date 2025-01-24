import { Agent, AgentResponse } from './types';
import { supabase } from '@/integrations/supabase/client';

export class PaymentAgent implements Agent {
  name = 'PaymentAgent';

  async canHandle(message: string): Promise<number> {
    const paymentKeywords = [
      'payment', 'invoice', 'pay', 'paid', 'amount',
      'fee', 'cost', 'price', 'deposit', 'refund'
    ];
    
    const messageWords = message.toLowerCase().split(' ');
    const matches = paymentKeywords.filter(keyword => 
      messageWords.some(word => word.includes(keyword.toLowerCase()))
    );
    
    return matches.length / paymentKeywords.length;
  }

  async process(message: string): Promise<AgentResponse> {
    try {
      const paymentMatch = message.match(/pay\s+(?:qar\s+)?(\d+(?:\.\d{2})?)\s+for\s+(?:invoice\s+)?#?(\w+)/i);
      
      if (paymentMatch) {
        const amount = parseFloat(paymentMatch[1]);
        const invoiceNumber = paymentMatch[2];

        const { data: invoice } = await supabase
          .from('accounting_invoices')
          .select('*')
          .eq('invoice_number', invoiceNumber)
          .single();

        if (!invoice) {
          return {
            content: `Invoice #${invoiceNumber} not found. Please verify the invoice number.`,
            confidence: 0.8
          };
        }

        return {
          content: `I can help you process the payment of QAR ${amount} for invoice #${invoiceNumber}. Would you like to proceed?`,
          confidence: 0.9,
          metadata: { invoice, amount }
        };
      }

      return {
        content: "I can help you with payments and invoices. What would you like to do?",
        confidence: 0.5
      };
    } catch (error) {
      console.error('PaymentAgent error:', error);
      return {
        content: "I encountered an error while processing payment information.",
        confidence: 0.1
      };
    }
  }
}