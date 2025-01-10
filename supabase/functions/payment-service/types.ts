export interface LeaseVerificationResult {
  id: string
  agreement_number: string | null
  customer_id: string
  profiles?: {
    id: string
    full_name: string | null
  }
}