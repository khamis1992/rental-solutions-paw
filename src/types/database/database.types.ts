// This file contains only the essential Database type definition
// All other types have been moved to their respective domain files
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Enums: {
      agreement_type: "lease_to_own" | "short_term"
      customer_status_type: "active" | "inactive" | "suspended" | "pending_review" | "blacklisted"
      lease_status: "pending_payment" | "pending_deposit" | "active" | "closed"
      maintenance_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      payment_method_type: "Invoice" | "Cash" | "WireTransfer" | "Cheque" | "Deposit" | "On_hold"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "admin" | "staff" | "customer" | "manager"
      vehicle_status: "available" | "rented" | "maintenance" | "retired" | "police_station" | "accident" | "reserve" | "stolen"
    }
  }
}