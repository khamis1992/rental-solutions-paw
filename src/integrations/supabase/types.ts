export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agreement_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          lease_id: string | null
          updated_at: string | null
          uploaded_by: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          lease_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          lease_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreement_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreement_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_import_errors: {
        Row: {
          created_at: string | null
          customer_identifier: string | null
          error_message: string | null
          id: string
          import_log_id: string | null
          row_data: Json | null
          row_number: number | null
        }
        Insert: {
          created_at?: string | null
          customer_identifier?: string | null
          error_message?: string | null
          id?: string
          import_log_id?: string | null
          row_data?: Json | null
          row_number?: number | null
        }
        Update: {
          created_at?: string | null
          customer_identifier?: string | null
          error_message?: string | null
          id?: string
          import_log_id?: string | null
          row_data?: Json | null
          row_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_import_errors_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "import_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      applied_discounts: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          lease_id: string
          promo_code_id: string | null
        }
        Insert: {
          created_at?: string
          discount_amount: number
          id?: string
          lease_id: string
          promo_code_id?: string | null
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          lease_id?: string
          promo_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applied_discounts_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applied_discounts_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promotional_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_assessments: {
        Row: {
          assessment_date: string
          created_at: string
          credit_score: number
          customer_id: string
          debt_to_income_ratio: number | null
          employment_status: string
          id: string
          monthly_income: number
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assessment_date?: string
          created_at?: string
          credit_score: number
          customer_id: string
          debt_to_income_ratio?: number | null
          employment_status: string
          id?: string
          monthly_income: number
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          created_at?: string
          credit_score?: number
          customer_id?: string
          debt_to_income_ratio?: number | null
          employment_status?: string
          id?: string
          monthly_income?: number
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_assessments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          note: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          note: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      damages: {
        Row: {
          created_at: string
          description: string
          id: string
          images: string[] | null
          lease_id: string
          notes: string | null
          repair_cost: number | null
          reported_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          lease_id: string
          notes?: string | null
          repair_cost?: number | null
          reported_date?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          lease_id?: string
          notes?: string | null
          repair_cost?: number | null
          reported_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "damages_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          created_at: string | null
          errors: Json | null
          file_name: string
          id: string
          import_type: string
          records_processed: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          errors?: Json | null
          file_name: string
          id?: string
          import_type: string
          records_processed?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          errors?: Json | null
          file_name?: string
          id?: string
          import_type?: string
          records_processed?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leases: {
        Row: {
          agreement_number: string | null
          agreement_type: Database["public"]["Enums"]["agreement_type"]
          checkin_date: string | null
          checkout_date: string | null
          created_at: string
          customer_id: string
          damage_penalty_rate: number | null
          down_payment: number | null
          early_payoff_allowed: boolean | null
          end_date: string | null
          fuel_penalty_rate: number | null
          id: string
          initial_mileage: number
          interest_rate: number | null
          late_fee_grace_period: unknown | null
          late_fee_rate: number | null
          late_return_fee: number | null
          lease_duration: unknown | null
          license_no: string | null
          license_number: string | null
          monthly_payment: number | null
          notes: string | null
          ownership_transferred: boolean | null
          return_date: string | null
          return_mileage: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["lease_status"] | null
          total_amount: number
          trade_in_value: number | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          agreement_number?: string | null
          agreement_type?: Database["public"]["Enums"]["agreement_type"]
          checkin_date?: string | null
          checkout_date?: string | null
          created_at?: string
          customer_id: string
          damage_penalty_rate?: number | null
          down_payment?: number | null
          early_payoff_allowed?: boolean | null
          end_date?: string | null
          fuel_penalty_rate?: number | null
          id?: string
          initial_mileage: number
          interest_rate?: number | null
          late_fee_grace_period?: unknown | null
          late_fee_rate?: number | null
          late_return_fee?: number | null
          lease_duration?: unknown | null
          license_no?: string | null
          license_number?: string | null
          monthly_payment?: number | null
          notes?: string | null
          ownership_transferred?: boolean | null
          return_date?: string | null
          return_mileage?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["lease_status"] | null
          total_amount: number
          trade_in_value?: number | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          agreement_number?: string | null
          agreement_type?: Database["public"]["Enums"]["agreement_type"]
          checkin_date?: string | null
          checkout_date?: string | null
          created_at?: string
          customer_id?: string
          damage_penalty_rate?: number | null
          down_payment?: number | null
          early_payoff_allowed?: boolean | null
          end_date?: string | null
          fuel_penalty_rate?: number | null
          id?: string
          initial_mileage?: number
          interest_rate?: number | null
          late_fee_grace_period?: unknown | null
          late_fee_rate?: number | null
          late_return_fee?: number | null
          lease_duration?: unknown | null
          license_no?: string | null
          license_number?: string | null
          monthly_payment?: number | null
          notes?: string | null
          ownership_transferred?: boolean | null
          return_date?: string | null
          return_mileage?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["lease_status"] | null
          total_amount?: number
          trade_in_value?: number | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          performed_by: string | null
          scheduled_date: string
          service_type: string
          status: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          scheduled_date: string
          service_type: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          scheduled_date?: string
          service_type?: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          actual_payment_date: string | null
          amount_due: number
          amount_paid: number | null
          created_at: string
          early_payment_discount: number | null
          id: string
          late_fee_applied: number | null
          lease_id: string
          original_due_date: string
          payment_id: string
          remaining_balance: number
          status: string
          updated_at: string
        }
        Insert: {
          actual_payment_date?: string | null
          amount_due: number
          amount_paid?: number | null
          created_at?: string
          early_payment_discount?: number | null
          id?: string
          late_fee_applied?: number | null
          lease_id: string
          original_due_date: string
          payment_id: string
          remaining_balance: number
          status?: string
          updated_at?: string
        }
        Update: {
          actual_payment_date?: string | null
          amount_due?: number
          amount_paid?: number | null
          created_at?: string
          early_payment_discount?: number | null
          id?: string
          late_fee_applied?: number | null
          lease_id?: string
          original_due_date?: string
          payment_id?: string
          remaining_balance?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedules: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          last_reminder_sent: string | null
          lease_id: string | null
          reminder_count: number | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          last_reminder_sent?: string | null
          lease_id?: string | null
          reminder_count?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          last_reminder_sent?: string | null
          lease_id?: string | null
          reminder_count?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          lease_id: string
          payment_date: string | null
          payment_method:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          security_deposit_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          lease_id: string
          payment_date?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          security_deposit_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          lease_id?: string
          payment_date?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          security_deposit_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_security_deposit_id_fkey"
            columns: ["security_deposit_id"]
            isOneToOne: false
            referencedRelation: "security_deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      penalties: {
        Row: {
          amount: number
          applied_date: string
          created_at: string
          description: string | null
          id: string
          lease_id: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          applied_date?: string
          created_at?: string
          description?: string | null
          id?: string
          lease_id: string
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          applied_date?: string
          created_at?: string
          description?: string | null
          id?: string
          lease_id?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalties_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          contract_document_url: string | null
          created_at: string
          driver_license: string | null
          full_name: string | null
          id: string
          id_document_url: string | null
          license_document_url: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contract_document_url?: string | null
          created_at?: string
          driver_license?: string | null
          full_name?: string | null
          id: string
          id_document_url?: string | null
          license_document_url?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contract_document_url?: string | null
          created_at?: string
          driver_license?: string | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          license_document_url?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      promotional_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date: string | null
          id: string
          max_uses: number | null
          min_rental_duration: number | null
          start_date: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date?: string | null
          id?: string
          max_uses?: number | null
          min_rental_duration?: number | null
          start_date: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          end_date?: string | null
          id?: string
          max_uses?: number | null
          min_rental_duration?: number | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessment_date: string
          created_at: string
          customer_id: string
          id: string
          late_payment_count: number
          missed_payment_count: number
          notes: string | null
          payment_score: number
          risk_level: string
          total_penalties: number
          updated_at: string
        }
        Insert: {
          assessment_date?: string
          created_at?: string
          customer_id: string
          id?: string
          late_payment_count?: number
          missed_payment_count?: number
          notes?: string | null
          payment_score: number
          risk_level: string
          total_penalties?: number
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          created_at?: string
          customer_id?: string
          id?: string
          late_payment_count?: number
          missed_payment_count?: number
          notes?: string | null
          payment_score?: number
          risk_level?: string
          total_penalties?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          lease_id: string
          notes: string | null
          refund_amount: number | null
          refund_date: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          lease_id: string
          notes?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          lease_id?: string
          notes?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_deposits_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_fines: {
        Row: {
          created_at: string | null
          fine_amount: number
          fine_date: string
          fine_location: string | null
          fine_reference: string | null
          fine_type: string
          id: string
          lease_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          fine_amount: number
          fine_date: string
          fine_location?: string | null
          fine_reference?: string | null
          fine_type: string
          id?: string
          lease_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          fine_amount?: number
          fine_date?: string
          fine_location?: string | null
          fine_reference?: string | null
          fine_type?: string
          id?: string
          lease_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_fines_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_fines_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_statuses: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          license_plate: string
          make: string
          mileage: number | null
          model: string
          status: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at: string
          vin: string
          year: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          license_plate: string
          make: string
          mileage?: number | null
          model: string
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string
          vin: string
          year: number
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          license_plate?: string
          make?: string
          mileage?: number | null
          model?: string
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string
          vin?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_credit_score: {
        Args: {
          p_monthly_income: number
          p_employment_status: string
          p_debt_to_income_ratio: number
        }
        Returns: number
      }
      calculate_risk_score: {
        Args: {
          p_customer_id: string
        }
        Returns: number
      }
      log_audit_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_changes: Json
          p_ip_address: string
        }
        Returns: undefined
      }
      update_payment_schedule: {
        Args: {
          p_lease_id: string
          p_delay_days?: number
        }
        Returns: undefined
      }
      update_risk_assessment: {
        Args: {
          p_customer_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      agreement_type: "lease_to_own" | "short_term"
      discount_type: "percentage" | "fixed_amount"
      import_type: "payments" | "customers" | "agreements"
      lease_status: "pending_payment" | "pending_deposit" | "active" | "closed"
      maintenance_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      payment_method_type:
        | "cash"
        | "wire_transfer"
        | "invoice"
        | "on_hold"
        | "deposit"
        | "cheque"
        | "credit_card"
        | "debit_card"
        | "bank_transfer"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "admin" | "staff" | "customer" | "manager"
      vehicle_status:
        | "available"
        | "rented"
        | "maintenance"
        | "retired"
        | "police_station"
        | "accident"
        | "reserve"
        | "stolen"
      vehicle_status_enum:
        | "maintenance"
        | "available"
        | "rented"
        | "police_station"
        | "accident"
        | "reserve"
        | "stolen"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
