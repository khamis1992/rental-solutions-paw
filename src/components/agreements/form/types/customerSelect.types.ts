import { Database } from "@/integrations/supabase/types";

export type CustomerProfile = Database['public']['Tables']['profiles']['Row'];

export interface CustomerSelectProps {
  register: any;
  onCustomerSelect?: (customerId: string) => void;
}

export interface CustomerSearchResult {
  customers: CustomerProfile[];
  nextPage: number | undefined;
  totalCount: number | null;
}