import { Database } from "@/integrations/supabase/types";

export type PaymentMethodType = Database['public']['Enums']['payment_method_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type ImportSourceType = 'csv' | 'manual' | 'api';
export type ImportStatusType = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  category_id?: string;
  transaction_date: string;
  status: PaymentStatus;
  payment_method?: PaymentMethodType;
  created_at?: string;
  updated_at?: string;
}

export interface UnifiedImportTracking {
  id: string;
  transaction_id: string;
  agreement_number: string;
  customer_name: string;
  license_plate: string;
  amount: number;
  payment_method: PaymentMethodType;
  description: string;
  payment_date: string;
  type: string;
  status: ImportStatusType;
  validation_status: boolean;
  processing_attempts: number;
  error_details?: string;
  created_at?: string;
  updated_at?: string;
}

export const REQUIRED_FIELDS = [
  'transaction_id',
  'agreement_number',
  'customer_name',
  'license_plate',
  'amount',
  'payment_method',
  'description',
  'payment_date',
  'type'
];

export const validateHeaders = (headers: string[]) => {
  const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};