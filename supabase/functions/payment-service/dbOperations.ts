import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { LeaseVerificationResult } from './types.ts';

export class DatabaseOperations {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }

  async verifyLease(leaseId: string): Promise<LeaseVerificationResult> {
    console.log('Verifying lease:', leaseId);
    
    const { data, error } = await this.supabase
      .from('leases')
      .select(`
        id,
        agreement_number,
        customer_id,
        profiles!leases_customer_id_fkey (
          id,
          full_name
        )
      `)
      .eq('id', leaseId)
      .single();

    if (error) {
      console.error('Lease verification error:', error);
      throw new Error('Failed to verify lease');
    }

    if (!data) {
      console.error('Lease not found:', leaseId);
      throw new Error('Lease not found');
    }

    return data;
  }

  async createPayment(params: {
    leaseId: string;
    amount: number;
    paymentMethod: string;
    description: string;
    type: string;
  }) {
    const { data, error } = await this.supabase
      .from('payments')
      .insert({
        lease_id: params.leaseId,
        amount: params.amount,
        payment_method: params.paymentMethod,
        description: params.description,
        status: 'completed',
        payment_date: new Date().toISOString(),
        amount_paid: params.amount,
        balance: 0,
        type: params.type
      })
      .select(`
        id,
        amount,
        payment_method,
        status,
        payment_date,
        leases!payments_lease_id_fkey (
          id,
          agreement_number,
          profiles!leases_customer_id_fkey (
            id,
            full_name
          )
        )
      `)
      .single();

    if (error) {
      console.error('Payment creation error:', error);
      throw new Error('Failed to create payment');
    }

    return data;
  }
}