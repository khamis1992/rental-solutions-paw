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
      accounting_categories: {
        Row: {
          budget_limit: number | null
          budget_period: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          budget_limit?: number | null
          budget_period?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          budget_limit?: number | null
          budget_period?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounting_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_invoices: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          due_date: string
          id: string
          invoice_number: string
          issued_date: string
          items: Json
          notes: string | null
          paid_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issued_date: string
          items: Json
          notes?: string | null
          paid_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issued_date?: string
          items?: Json
          notes?: string | null
          paid_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_transactions: {
        Row: {
          agreement_number: string | null
          amount: string | null
          category_id: string | null
          created_at: string | null
          customer_name: string | null
          description: string | null
          id: string | null
          license_plate: string | null
          payment_method: string | null
          receipt_url: string | null
          status: string | null
          transaction_date: string | null
          transaction_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          agreement_number?: string | null
          amount?: string | null
          category_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string | null
          license_plate?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          agreement_number?: string | null
          amount?: string | null
          category_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string | null
          license_plate?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "accounting_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_documents: {
        Row: {
          assignment_method: string | null
          created_at: string | null
          document_type: string
          document_url: string
          file_size: number | null
          id: string
          lease_id: string | null
          matched_agreement_number: string | null
          original_filename: string | null
          updated_at: string | null
          upload_status: string | null
          uploaded_by: string | null
          vehicle_id: string | null
        }
        Insert: {
          assignment_method?: string | null
          created_at?: string | null
          document_type: string
          document_url: string
          file_size?: number | null
          id?: string
          lease_id?: string | null
          matched_agreement_number?: string | null
          original_filename?: string | null
          updated_at?: string | null
          upload_status?: string | null
          uploaded_by?: string | null
          vehicle_id?: string | null
        }
        Update: {
          assignment_method?: string | null
          created_at?: string | null
          document_type?: string
          document_url?: string
          file_size?: number | null
          id?: string
          lease_id?: string | null
          matched_agreement_number?: string | null
          original_filename?: string | null
          updated_at?: string | null
          upload_status?: string | null
          uploaded_by?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "customer_statuses"
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
      ai_case_analysis: {
        Row: {
          analysis_result: Json
          analysis_type: string
          case_id: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          model_version: string | null
          updated_at: string | null
        }
        Insert: {
          analysis_result: Json
          analysis_type: string
          case_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          model_version?: string | null
          updated_at?: string | null
        }
        Update: {
          analysis_result?: Json
          analysis_type?: string
          case_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          model_version?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_case_analysis_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_document_classification: {
        Row: {
          classification_type: string
          confidence_score: number | null
          created_at: string | null
          document_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          classification_type: string
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          classification_type?: string
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_document_classification_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          category: string
          created_at: string | null
          id: string
          impact_score: number | null
          implemented_at: string | null
          insight: string
          priority: number
          recommendation: string
          status: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          impact_score?: number | null
          implemented_at?: string | null
          insight: string
          priority: number
          recommendation: string
          status?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          impact_score?: number | null
          implemented_at?: string | null
          insight?: string
          priority?: number
          recommendation?: string
          status?: string | null
        }
        Relationships: []
      }
      ai_payment_analysis: {
        Row: {
          analysis_type: string
          anomaly_details: Json | null
          anomaly_detected: boolean | null
          confidence_score: number | null
          created_at: string | null
          id: string
          payment_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          suggested_corrections: Json | null
        }
        Insert: {
          analysis_type: string
          anomaly_details?: Json | null
          anomaly_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          payment_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          suggested_corrections?: Json | null
        }
        Update: {
          analysis_type?: string
          anomaly_details?: Json | null
          anomaly_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          payment_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          suggested_corrections?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_payment_analysis_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_payment_analysis_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_payment_analysis_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_insights: {
        Row: {
          action_taken: boolean | null
          analyzed_at: string | null
          category: string
          confidence_score: number | null
          created_at: string | null
          data_points: Json | null
          id: string
          insight: string
          priority: number | null
          status: string | null
        }
        Insert: {
          action_taken?: boolean | null
          analyzed_at?: string | null
          category: string
          confidence_score?: number | null
          created_at?: string | null
          data_points?: Json | null
          id?: string
          insight: string
          priority?: number | null
          status?: string | null
        }
        Update: {
          action_taken?: boolean | null
          analyzed_at?: string | null
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          data_points?: Json | null
          id?: string
          insight?: string
          priority?: number | null
          status?: string | null
        }
        Relationships: []
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
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
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
          performed_by: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          performed_by?: string | null
        }
        Relationships: []
      }
      car_installment_contracts: {
        Row: {
          amount_paid: number | null
          amount_pending: number
          car_type: string
          category: string
          created_at: string
          id: string
          installment_value: number
          model_year: number
          number_of_cars: number
          price_per_car: number
          remaining_installments: number
          total_contract_value: number
          total_installments: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          amount_pending: number
          car_type: string
          category: string
          created_at?: string
          id?: string
          installment_value: number
          model_year: number
          number_of_cars?: number
          price_per_car: number
          remaining_installments: number
          total_contract_value: number
          total_installments: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          amount_pending?: number
          car_type?: string
          category?: string
          created_at?: string
          id?: string
          installment_value?: number
          model_year?: number
          number_of_cars?: number
          price_per_car?: number
          remaining_installments?: number
          total_contract_value?: number
          total_installments?: number
          updated_at?: string
        }
        Relationships: []
      }
      car_installment_payments: {
        Row: {
          amount: number
          cheque_number: string
          contract_id: string | null
          created_at: string
          drawee_bank: string
          id: string
          paid_amount: number | null
          payment_date: string
          remaining_amount: number
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cheque_number: string
          contract_id?: string | null
          created_at?: string
          drawee_bank: string
          id?: string
          paid_amount?: number | null
          payment_date: string
          remaining_amount: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cheque_number?: string
          contract_id?: string | null
          created_at?: string
          drawee_bank?: string
          id?: string
          paid_amount?: number | null
          payment_date?: string
          remaining_amount?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_installment_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "car_installment_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      case_duration_analytics: {
        Row: {
          avg_duration: number | null
          calculated_at: string | null
          case_type: string
          id: string
          max_duration: number | null
          min_duration: number | null
          sample_size: number | null
          std_deviation: number | null
          time_period: string
        }
        Insert: {
          avg_duration?: number | null
          calculated_at?: string | null
          case_type: string
          id?: string
          max_duration?: number | null
          min_duration?: number | null
          sample_size?: number | null
          std_deviation?: number | null
          time_period: string
        }
        Update: {
          avg_duration?: number | null
          calculated_at?: string | null
          case_type?: string
          id?: string
          max_duration?: number | null
          min_duration?: number | null
          sample_size?: number | null
          std_deviation?: number | null
          time_period?: string
        }
        Relationships: []
      }
      case_outcome_predictions: {
        Row: {
          case_id: string | null
          confidence_score: number
          created_at: string | null
          id: string
          predicted_cost: number | null
          predicted_duration: number | null
          predicted_outcome: string
          prediction_date: string | null
          risk_factors: Json | null
          similar_cases: Json | null
          success_probability: number | null
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          confidence_score: number
          created_at?: string | null
          id?: string
          predicted_cost?: number | null
          predicted_duration?: number | null
          predicted_outcome: string
          prediction_date?: string | null
          risk_factors?: Json | null
          similar_cases?: Json | null
          success_probability?: number | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          confidence_score?: number
          created_at?: string | null
          id?: string
          predicted_cost?: number | null
          predicted_duration?: number | null
          predicted_outcome?: string
          prediction_date?: string | null
          risk_factors?: Json | null
          similar_cases?: Json | null
          success_probability?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_outcome_predictions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_status_distribution: {
        Row: {
          calculated_at: string | null
          count: number | null
          id: string
          percentage: number | null
          status: string
          time_period: string
        }
        Insert: {
          calculated_at?: string | null
          count?: number | null
          id?: string
          percentage?: number | null
          status: string
          time_period: string
        }
        Update: {
          calculated_at?: string | null
          count?: number | null
          id?: string
          percentage?: number | null
          status?: string
          time_period?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          automatic_updates: boolean | null
          business_email: string | null
          company_name: string | null
          created_at: string
          dark_mode: boolean | null
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          automatic_updates?: boolean | null
          business_email?: string | null
          company_name?: string | null
          created_at?: string
          dark_mode?: boolean | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          automatic_updates?: boolean | null
          business_email?: string | null
          company_name?: string | null
          created_at?: string
          dark_mode?: boolean | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      compliance_alerts: {
        Row: {
          alert_type: string
          company_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          message: string
          resolved_at: string | null
          severity: string
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          company_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          message: string
          resolved_at?: string | null
          severity: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          company_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          message?: string
          resolved_at?: string | null
          severity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_documents: {
        Row: {
          company_id: string | null
          created_at: string | null
          document_type: string
          document_url: string
          expiry_date: string | null
          id: string
          metadata: Json | null
          retention_period: unknown | null
          tax_period: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          document_type: string
          document_url: string
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          retention_period?: unknown | null
          tax_period?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          document_type?: string
          document_url?: string
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          retention_period?: unknown | null
          tax_period?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_documents_company_id_fkey"
            columns: ["company_id"]
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
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_assessments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      csv_import_mappings: {
        Row: {
          created_at: string | null
          created_by: string | null
          field_mappings: Json
          id: string
          is_active: boolean | null
          mapping_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          field_mappings: Json
          id?: string
          is_active?: boolean | null
          mapping_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          field_mappings?: Json
          id?: string
          is_active?: boolean | null
          mapping_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csv_import_mappings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "csv_import_mappings_created_by_fkey"
            columns: ["created_by"]
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
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "customer_statuses"
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
      customer_segments: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          customer_id: string | null
          features: Json
          id: string
          segment_description: string | null
          segment_name: string
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          customer_id?: string | null
          features: Json
          id?: string
          segment_description?: string | null
          segment_name: string
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          customer_id?: string | null
          features?: Json
          id?: string
          segment_description?: string | null
          segment_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_segments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_segments_customer_id_fkey"
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
          damage_location: string | null
          description: string
          id: string
          images: string[] | null
          lease_id: string | null
          notes: string | null
          repair_cost: number | null
          reported_date: string
          status: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          damage_location?: string | null
          description: string
          id?: string
          images?: string[] | null
          lease_id?: string | null
          notes?: string | null
          repair_cost?: number | null
          reported_date?: string
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          damage_location?: string | null
          description?: string
          id?: string
          images?: string[] | null
          lease_id?: string | null
          notes?: string | null
          repair_cost?: number | null
          reported_date?: string
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "damages_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damages_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damages_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          document_type: string
          document_url: string
          extracted_data: Json | null
          id: string
          profile_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          document_type: string
          document_url: string
          extracted_data?: Json | null
          id?: string
          profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          document_type?: string
          document_url?: string
          extracted_data?: Json | null
          id?: string
          profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_analysis_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_analysis_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_imports: {
        Row: {
          amount: number
          created_at: string | null
          customer_name: string
          description: string | null
          id: string
          lease_id: string | null
          license_plate: string | null
          payment_date: string
          payment_method: string | null
          status: string | null
          transaction_id: string | null
          type: string
          updated_at: string | null
          vehicle: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_name: string
          description?: string | null
          id?: string
          lease_id?: string | null
          license_plate?: string | null
          payment_date: string
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
          type: string
          updated_at?: string | null
          vehicle?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_name?: string
          description?: string | null
          id?: string
          lease_id?: string | null
          license_plate?: string | null
          payment_date?: string
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
          type?: string
          updated_at?: string | null
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_imports_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_imports_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_optimization_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string
          estimated_impact: number | null
          id: string
          implemented_at: string | null
          priority: string
          recommendation_type: string
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description: string
          estimated_impact?: number | null
          id?: string
          implemented_at?: string | null
          priority: string
          recommendation_type: string
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          estimated_impact?: number | null
          id?: string
          implemented_at?: string | null
          priority?: string
          recommendation_type?: string
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_optimization_recommendations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      help_faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_features: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_guide_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_guides: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          steps: Json
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          steps: Json
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          steps?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_guides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_guide_categories"
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
      installment_analytics: {
        Row: {
          analysis_type: string
          created_at: string | null
          id: string
          insights: string | null
          lease_id: string | null
          metrics: Json
          recommendations: string[] | null
          updated_at: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string | null
          id?: string
          insights?: string | null
          lease_id?: string | null
          metrics: Json
          recommendations?: string[] | null
          updated_at?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string | null
          id?: string
          insights?: string | null
          lease_id?: string | null
          metrics?: Json
          recommendations?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installment_analytics_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installment_analytics_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          agreement_duration: unknown
          agreement_number: string | null
          agreement_sequence: number
          agreement_type: Database["public"]["Enums"]["agreement_type"]
          checkin_date: string | null
          checkout_date: string | null
          created_at: string
          customer_id: string
          daily_late_fine: number | null
          damage_penalty_rate: number | null
          down_payment: number | null
          early_payoff_allowed: boolean | null
          end_date: string | null
          fuel_penalty_rate: number | null
          id: string
          initial_mileage: number
          interest_rate: number | null
          last_payment_date: string | null
          late_fee_grace_period: unknown | null
          late_fee_rate: number | null
          late_fine_start_day: number | null
          late_return_fee: number | null
          lease_duration: unknown | null
          license_no: string | null
          license_number: string | null
          monthly_payment: number | null
          next_payment_date: string | null
          notes: string | null
          ownership_transferred: boolean | null
          payment_frequency: string | null
          payment_status: string | null
          rent_amount: number | null
          rent_due_day: number | null
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
          agreement_duration: unknown
          agreement_number?: string | null
          agreement_sequence?: number
          agreement_type?: Database["public"]["Enums"]["agreement_type"]
          checkin_date?: string | null
          checkout_date?: string | null
          created_at?: string
          customer_id: string
          daily_late_fine?: number | null
          damage_penalty_rate?: number | null
          down_payment?: number | null
          early_payoff_allowed?: boolean | null
          end_date?: string | null
          fuel_penalty_rate?: number | null
          id?: string
          initial_mileage: number
          interest_rate?: number | null
          last_payment_date?: string | null
          late_fee_grace_period?: unknown | null
          late_fee_rate?: number | null
          late_fine_start_day?: number | null
          late_return_fee?: number | null
          lease_duration?: unknown | null
          license_no?: string | null
          license_number?: string | null
          monthly_payment?: number | null
          next_payment_date?: string | null
          notes?: string | null
          ownership_transferred?: boolean | null
          payment_frequency?: string | null
          payment_status?: string | null
          rent_amount?: number | null
          rent_due_day?: number | null
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
          agreement_duration?: unknown
          agreement_number?: string | null
          agreement_sequence?: number
          agreement_type?: Database["public"]["Enums"]["agreement_type"]
          checkin_date?: string | null
          checkout_date?: string | null
          created_at?: string
          customer_id?: string
          daily_late_fine?: number | null
          damage_penalty_rate?: number | null
          down_payment?: number | null
          early_payoff_allowed?: boolean | null
          end_date?: string | null
          fuel_penalty_rate?: number | null
          id?: string
          initial_mileage?: number
          interest_rate?: number | null
          last_payment_date?: string | null
          late_fee_grace_period?: unknown | null
          late_fee_rate?: number | null
          late_fine_start_day?: number | null
          late_return_fee?: number | null
          lease_duration?: unknown | null
          license_no?: string | null
          license_number?: string | null
          monthly_payment?: number | null
          next_payment_date?: string | null
          notes?: string | null
          ownership_transferred?: boolean | null
          payment_frequency?: string | null
          payment_status?: string | null
          rent_amount?: number | null
          rent_due_day?: number | null
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
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
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
      legal_case_history: {
        Row: {
          action: string
          case_id: string | null
          created_at: string
          description: string | null
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          case_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          case_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_case_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_case_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_case_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_case_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          workflow_steps: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          workflow_steps?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          workflow_steps?: Json
        }
        Relationships: []
      }
      legal_cases: {
        Row: {
          amount_owed: number | null
          assigned_to: string | null
          case_type: string
          created_at: string
          customer_id: string
          description: string | null
          escalation_date: string | null
          id: string
          last_reminder_sent: string | null
          priority: string | null
          reminder_count: number | null
          resolution_date: string | null
          resolution_notes: string | null
          status: Database["public"]["Enums"]["legal_case_status"] | null
          updated_at: string
        }
        Insert: {
          amount_owed?: number | null
          assigned_to?: string | null
          case_type: string
          created_at?: string
          customer_id: string
          description?: string | null
          escalation_date?: string | null
          id?: string
          last_reminder_sent?: string | null
          priority?: string | null
          reminder_count?: number | null
          resolution_date?: string | null
          resolution_notes?: string | null
          status?: Database["public"]["Enums"]["legal_case_status"] | null
          updated_at?: string
        }
        Update: {
          amount_owed?: number | null
          assigned_to?: string | null
          case_type?: string
          created_at?: string
          customer_id?: string
          description?: string | null
          escalation_date?: string | null
          id?: string
          last_reminder_sent?: string | null
          priority?: string | null
          reminder_count?: number | null
          resolution_date?: string | null
          resolution_notes?: string | null
          status?: Database["public"]["Enums"]["legal_case_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_communications: {
        Row: {
          case_id: string | null
          content: string
          created_at: string
          delivery_status: string | null
          id: string
          recipient_details: Json | null
          recipient_type: string
          sent_date: string | null
          type: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          content: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          recipient_details?: Json | null
          recipient_type: string
          sent_date?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          content?: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          recipient_details?: Json | null
          recipient_type?: string
          sent_date?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_communications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_compliance_items: {
        Row: {
          case_id: string | null
          completed_date: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          priority: string | null
          reminder_sent: boolean | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          priority?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          priority?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_compliance_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_document_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          language: Database["public"]["Enums"]["document_language"] | null
          name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: Database["public"]["Enums"]["document_language"] | null
          name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: Database["public"]["Enums"]["document_language"] | null
          name?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_document_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_document_versions: {
        Row: {
          changes_summary: string | null
          content: string
          created_at: string | null
          created_by: string | null
          document_id: string | null
          id: string
          metadata: Json | null
          signature_status: string | null
          signatures: Json | null
          status: Database["public"]["Enums"]["document_version_status"] | null
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          signature_status?: string | null
          signatures?: Json | null
          status?: Database["public"]["Enums"]["document_version_status"] | null
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          signature_status?: string | null
          signatures?: Json | null
          status?: Database["public"]["Enums"]["document_version_status"] | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          case_id: string | null
          content: string
          created_at: string
          document_type: string | null
          expiry_date: string | null
          generated_by: string | null
          id: string
          language: Database["public"]["Enums"]["document_language"] | null
          status: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          content: string
          created_at?: string
          document_type?: string | null
          expiry_date?: string | null
          generated_by?: string | null
          id?: string
          language?: Database["public"]["Enums"]["document_language"] | null
          status?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          content?: string
          created_at?: string
          document_type?: string | null
          expiry_date?: string | null
          generated_by?: string | null
          id?: string
          language?: Database["public"]["Enums"]["document_language"] | null
          status?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_documents_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_documents_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "legal_document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_email_communications: {
        Row: {
          case_id: string | null
          content: string
          created_at: string | null
          delivered_at: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          sender_email: string
          sent_at: string | null
          status: string
          subject: string
          tracking_id: string | null
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          content: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          sender_email: string
          sent_at?: string | null
          status?: string
          subject: string
          tracking_id?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          sender_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          tracking_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_email_communications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_notification_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          language: Database["public"]["Enums"]["document_language"] | null
          name: string
          subject: string | null
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          language?: Database["public"]["Enums"]["document_language"] | null
          name: string
          subject?: string | null
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          language?: Database["public"]["Enums"]["document_language"] | null
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_notification_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_notification_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_research_queries: {
        Row: {
          case_id: string | null
          created_at: string | null
          id: string
          performed_by: string | null
          query_text: string
          results: Json | null
          source: string
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          performed_by?: string | null
          query_text: string
          results?: Json | null
          source?: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          performed_by?: string | null
          query_text?: string
          results?: Json | null
          source?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_research_queries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_research_queries_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_research_queries_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_settlements: {
        Row: {
          case_id: string | null
          created_at: string
          id: string
          paid_amount: number | null
          payment_plan: Json | null
          payments: Json | null
          receipt_url: string | null
          signed_by_company: boolean | null
          signed_by_customer: boolean | null
          signed_date: string | null
          status: string | null
          terms: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          id?: string
          paid_amount?: number | null
          payment_plan?: Json | null
          payments?: Json | null
          receipt_url?: string | null
          signed_by_company?: boolean | null
          signed_by_customer?: boolean | null
          signed_date?: string | null
          status?: string | null
          terms: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          id?: string
          paid_amount?: number | null
          payment_plan?: Json | null
          payments?: Json | null
          receipt_url?: string | null
          signed_by_company?: boolean | null
          signed_by_customer?: boolean | null
          signed_date?: string | null
          status?: string | null
          terms?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_settlements_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          language: string | null
          name: string
          updated_at: string
          variables: Json
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          name: string
          updated_at?: string
          variables?: Json
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          name?: string
          updated_at?: string
          variables?: Json
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          category_id: string | null
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
          category_id?: string | null
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
          category_id?: string | null
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
            foreignKeyName: "maintenance_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "maintenance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          maintenance_id: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          maintenance_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          maintenance_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_documents_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_predictions: {
        Row: {
          ai_analysis_details: Json | null
          ai_model: string | null
          confidence_score: number | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          predicted_date: string | null
          predicted_issues: string[] | null
          prediction_type: string
          priority: string | null
          recommended_services: string[] | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          ai_analysis_details?: Json | null
          ai_model?: string | null
          confidence_score?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          predicted_date?: string | null
          predicted_issues?: string[] | null
          prediction_type: string
          priority?: string | null
          recommended_services?: string[] | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          ai_analysis_details?: Json | null
          ai_model?: string | null
          confidence_score?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          predicted_date?: string | null
          predicted_issues?: string[] | null
          prediction_type?: string
          priority?: string | null
          recommended_services?: string[] | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      new_unified_payments: {
        Row: {
          amount: number
          amount_paid: number | null
          balance: number | null
          created_at: string | null
          days_overdue: number | null
          description: string | null
          due_date: string | null
          id: string
          include_in_calculation: boolean | null
          invoice_id: string | null
          is_recurring: boolean | null
          late_fine_amount: number | null
          lease_id: string | null
          next_payment_date: string | null
          payment_date: string | null
          payment_method:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recurring_interval: unknown | null
          security_deposit_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          balance?: number | null
          created_at?: string | null
          days_overdue?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          include_in_calculation?: boolean | null
          invoice_id?: string | null
          is_recurring?: boolean | null
          late_fine_amount?: number | null
          lease_id?: string | null
          next_payment_date?: string | null
          payment_date?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recurring_interval?: unknown | null
          security_deposit_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          balance?: number | null
          created_at?: string | null
          days_overdue?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          include_in_calculation?: boolean | null
          invoice_id?: string | null
          is_recurring?: boolean | null
          late_fine_amount?: number | null
          lease_id?: string | null
          next_payment_date?: string | null
          payment_date?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recurring_interval?: unknown | null
          security_deposit_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_unified_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "accounting_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_unified_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_unified_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_unified_payments_security_deposit_id_fkey"
            columns: ["security_deposit_id"]
            isOneToOne: false
            referencedRelation: "security_deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_anomalies: {
        Row: {
          affected_records: Json | null
          description: string
          detected_at: string | null
          detection_type: string
          false_positive: boolean | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          affected_records?: Json | null
          description: string
          detected_at?: string | null
          detection_type: string
          false_positive?: boolean | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity: string
        }
        Update: {
          affected_records?: Json | null
          description?: string
          detected_at?: string | null
          detection_type?: string
          false_positive?: boolean | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      optimized_routes: {
        Row: {
          created_at: string | null
          date: string
          id: string
          optimization_score: number | null
          route_order: number[]
          schedule_ids: string[]
          total_distance: number | null
          total_duration: number | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          optimization_score?: number | null
          route_order: number[]
          schedule_ids: string[]
          total_distance?: number | null
          total_duration?: number | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          optimization_score?: number | null
          route_order?: number[]
          schedule_ids?: string[]
          total_distance?: number | null
          total_duration?: number | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimized_routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      overdue_payments: {
        Row: {
          agreement_id: string | null
          amount_paid: number
          balance: number
          created_at: string | null
          customer_id: string | null
          days_overdue: number | null
          id: string
          last_payment_date: string | null
          notes: string | null
          status: Database["public"]["Enums"]["overdue_payment_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          agreement_id?: string | null
          amount_paid?: number
          balance?: number
          created_at?: string | null
          customer_id?: string | null
          days_overdue?: number | null
          id?: string
          last_payment_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["overdue_payment_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          agreement_id?: string | null
          amount_paid?: number
          balance?: number
          created_at?: string | null
          customer_id?: string | null
          days_overdue?: number | null
          id?: string
          last_payment_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["overdue_payment_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "overdue_payments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: true
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_payments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: true
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_date_migration_logs: {
        Row: {
          created_at: string | null
          id: string
          original_date: string | null
          payment_id: string | null
          reason: string | null
          table_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_date?: string | null
          payment_id?: string | null
          reason?: string | null
          table_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          original_date?: string | null
          payment_id?: string | null
          reason?: string | null
          table_name?: string | null
        }
        Relationships: []
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
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
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
      payment_matching_logs: {
        Row: {
          admin_reviewed: boolean | null
          admin_reviewed_at: string | null
          admin_reviewed_by: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          is_ai_matched: boolean | null
          match_confidence: number
          matching_factors: Json | null
          payment_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_reviewed?: boolean | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_ai_matched?: boolean | null
          match_confidence: number
          matching_factors?: Json | null
          payment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_reviewed?: boolean | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_ai_matched?: boolean | null
          match_confidence?: number
          matching_factors?: Json | null
          payment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_matching_logs_admin_reviewed_by_fkey"
            columns: ["admin_reviewed_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_matching_logs_admin_reviewed_by_fkey"
            columns: ["admin_reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_matching_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_matching_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_matching_logs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reconciliation: {
        Row: {
          auto_matched: boolean | null
          created_at: string | null
          discrepancy_details: Json | null
          id: string
          lease_id: string | null
          match_confidence: number | null
          payment_id: string | null
          reconciliation_status: string | null
          updated_at: string | null
        }
        Insert: {
          auto_matched?: boolean | null
          created_at?: string | null
          discrepancy_details?: Json | null
          id?: string
          lease_id?: string | null
          match_confidence?: number | null
          payment_id?: string | null
          reconciliation_status?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_matched?: boolean | null
          created_at?: string | null
          discrepancy_details?: Json | null
          id?: string
          lease_id?: string | null
          match_confidence?: number | null
          payment_id?: string | null
          reconciliation_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reconciliation_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reconciliation_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reconciliation_payment_id_fkey"
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
          contract_name: string | null
          created_at: string
          due_date: string
          id: string
          last_reminder_sent: string | null
          lease_id: string | null
          metadata: Json | null
          reminder_count: number | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string
        }
        Insert: {
          amount: number
          contract_name?: string | null
          created_at?: string
          due_date: string
          id?: string
          last_reminder_sent?: string | null
          lease_id?: string | null
          metadata?: Json | null
          reminder_count?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_name?: string | null
          created_at?: string
          due_date?: string
          id?: string
          last_reminder_sent?: string | null
          lease_id?: string | null
          metadata?: Json | null
          reminder_count?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
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
          amount_paid: number | null
          balance: number | null
          created_at: string
          days_overdue: number | null
          description: string | null
          id: string
          include_in_calculation: boolean | null
          invoice_id: string | null
          is_recurring: boolean | null
          late_fine_amount: number | null
          lease_id: string | null
          next_payment_date: string | null
          payment_date: string | null
          payment_method:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recurring_interval: unknown | null
          security_deposit_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          balance?: number | null
          created_at?: string
          days_overdue?: number | null
          description?: string | null
          id?: string
          include_in_calculation?: boolean | null
          invoice_id?: string | null
          is_recurring?: boolean | null
          late_fine_amount?: number | null
          lease_id?: string | null
          next_payment_date?: string | null
          payment_date?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recurring_interval?: unknown | null
          security_deposit_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          balance?: number | null
          created_at?: string
          days_overdue?: number | null
          description?: string | null
          id?: string
          include_in_calculation?: boolean | null
          invoice_id?: string | null
          is_recurring?: boolean | null
          late_fine_amount?: number | null
          lease_id?: string | null
          next_payment_date?: string | null
          payment_date?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recurring_interval?: unknown | null
          security_deposit_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "accounting_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalties_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          context: Json | null
          cpu_utilization: number | null
          id: string
          metric_type: string
          timestamp: string | null
          value: number
        }
        Insert: {
          context?: Json | null
          cpu_utilization?: number | null
          id?: string
          metric_type: string
          timestamp?: string | null
          value: number
        }
        Update: {
          context?: Json | null
          cpu_utilization?: number | null
          id?: string
          metric_type?: string
          timestamp?: string | null
          value?: number
        }
        Relationships: []
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
          ai_confidence_score: number | null
          ai_generated_fields: Json | null
          analysis_confidence_score: number | null
          contract_document_url: string | null
          created_at: string
          document_analysis_status: string | null
          driver_license: string | null
          email: string | null
          extracted_data: Json | null
          full_name: string | null
          id: string
          id_document_url: string | null
          is_ai_generated: boolean | null
          last_login: string | null
          license_document_url: string | null
          nationality: string | null
          needs_review: boolean | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["customer_status_type"] | null
          status_notes: string | null
          status_updated_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          ai_confidence_score?: number | null
          ai_generated_fields?: Json | null
          analysis_confidence_score?: number | null
          contract_document_url?: string | null
          created_at?: string
          document_analysis_status?: string | null
          driver_license?: string | null
          email?: string | null
          extracted_data?: Json | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          is_ai_generated?: boolean | null
          last_login?: string | null
          license_document_url?: string | null
          nationality?: string | null
          needs_review?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["customer_status_type"] | null
          status_notes?: string | null
          status_updated_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          ai_confidence_score?: number | null
          ai_generated_fields?: Json | null
          analysis_confidence_score?: number | null
          contract_document_url?: string | null
          created_at?: string
          document_analysis_status?: string | null
          driver_license?: string | null
          email?: string | null
          extracted_data?: Json | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          is_ai_generated?: boolean | null
          last_login?: string | null
          license_document_url?: string | null
          nationality?: string | null
          needs_review?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["customer_status_type"] | null
          status_notes?: string | null
          status_updated_at?: string | null
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
      raw_payment_imports: {
        Row: {
          Agreement_Number: string | null
          Amount: number | null
          created_at: string | null
          Customer_Name: string | null
          Description: string | null
          error_description: string | null
          id: string
          is_valid: boolean | null
          License_Plate: string | null
          Payment_Date: string | null
          Payment_Method: string | null
          Status: string | null
          Transaction_ID: string | null
          Type: string | null
        }
        Insert: {
          Agreement_Number?: string | null
          Amount?: number | null
          created_at?: string | null
          Customer_Name?: string | null
          Description?: string | null
          error_description?: string | null
          id?: string
          is_valid?: boolean | null
          License_Plate?: string | null
          Payment_Date?: string | null
          Payment_Method?: string | null
          Status?: string | null
          Transaction_ID?: string | null
          Type?: string | null
        }
        Update: {
          Agreement_Number?: string | null
          Amount?: number | null
          created_at?: string | null
          Customer_Name?: string | null
          Description?: string | null
          error_description?: string | null
          id?: string
          is_valid?: boolean | null
          License_Plate?: string | null
          Payment_Date?: string | null
          Payment_Method?: string | null
          Status?: string | null
          Transaction_ID?: string | null
          Type?: string | null
        }
        Relationships: []
      }
      raw_transaction_imports: {
        Row: {
          created_at: string | null
          error_description: string | null
          id: string
          import_id: string | null
          is_valid: boolean | null
          raw_data: Json
        }
        Insert: {
          created_at?: string | null
          error_description?: string | null
          id?: string
          import_id?: string | null
          is_valid?: boolean | null
          raw_data: Json
        }
        Update: {
          created_at?: string | null
          error_description?: string | null
          id?: string
          import_id?: string | null
          is_valid?: boolean | null
          raw_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "raw_transaction_imports_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "transaction_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_revenue: {
        Row: {
          amount: number
          created_at: string | null
          frequency: string
          id: string
          last_processed_date: string | null
          lease_id: string | null
          next_due_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          frequency: string
          id?: string
          last_processed_date?: string | null
          lease_id?: string | null
          next_due_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          frequency?: string
          id?: string
          last_processed_date?: string | null
          lease_id?: string | null
          next_due_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_revenue_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_revenue_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      remaining_amounts: {
        Row: {
          agreement_duration: unknown | null
          agreement_number: string
          amount_paid: number
          created_at: string
          final_price: number
          id: string
          import_status: Database["public"]["Enums"]["import_status"] | null
          lease_id: string | null
          license_plate: string
          remaining_amount: number
          rent_amount: number
          updated_at: string
        }
        Insert: {
          agreement_duration?: unknown | null
          agreement_number: string
          amount_paid: number
          created_at?: string
          final_price: number
          id?: string
          import_status?: Database["public"]["Enums"]["import_status"] | null
          lease_id?: string | null
          license_plate: string
          remaining_amount: number
          rent_amount: number
          updated_at?: string
        }
        Update: {
          agreement_duration?: unknown | null
          agreement_number?: string
          amount_paid?: number
          created_at?: string
          final_price?: number
          id?: string
          import_status?: Database["public"]["Enums"]["import_status"] | null
          lease_id?: string | null
          license_plate?: string
          remaining_amount?: number
          rent_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "remaining_amounts_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remaining_amounts_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_payments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          fine_amount: number | null
          id: string
          lease_id: string
          payment_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          fine_amount?: number | null
          id?: string
          lease_id: string
          payment_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          fine_amount?: number | null
          id?: string
          lease_id?: string
          payment_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rent_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_patterns: {
        Row: {
          created_at: string | null
          detection_rules: Json
          id: string
          pattern_name: string
          pattern_type: string
          risk_level: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          detection_rules: Json
          id?: string
          pattern_name: string
          pattern_type: string
          risk_level: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          detection_rules?: Json
          id?: string
          pattern_name?: string
          pattern_type?: string
          risk_level?: string
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_deposits_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      service_communication_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          request_type: string
          response_time: number | null
          source_service: string
          status_code: number | null
          target_service: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_type: string
          response_time?: number | null
          source_service: string
          status_code?: number | null
          target_service: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_type?: string
          response_time?: number | null
          source_service?: string
          status_code?: number | null
          target_service?: string
        }
        Relationships: []
      }
      service_registry: {
        Row: {
          api_version: string
          created_at: string | null
          endpoint_url: string
          health_status: string | null
          id: string
          last_health_check: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          api_version: string
          created_at?: string | null
          endpoint_url: string
          health_status?: string | null
          id?: string
          last_health_check?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          api_version?: string
          created_at?: string | null
          endpoint_url?: string
          health_status?: string | null
          id?: string
          last_health_check?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settlement_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string | null
          receipt_url: string | null
          settlement_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          settlement_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          settlement_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlement_payments_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "legal_settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_filings: {
        Row: {
          ai_validation_notes: Json | null
          ai_validation_status: string | null
          company_id: string | null
          created_at: string | null
          due_date: string
          filing_type: string
          id: string
          interest_amount: number | null
          penalties_amount: number | null
          status: Database["public"]["Enums"]["tax_filing_status"] | null
          submission_date: string | null
          tax_period_end: string
          tax_period_start: string
          total_tax_amount: number | null
          updated_at: string | null
        }
        Insert: {
          ai_validation_notes?: Json | null
          ai_validation_status?: string | null
          company_id?: string | null
          created_at?: string | null
          due_date: string
          filing_type: string
          id?: string
          interest_amount?: number | null
          penalties_amount?: number | null
          status?: Database["public"]["Enums"]["tax_filing_status"] | null
          submission_date?: string | null
          tax_period_end: string
          tax_period_start: string
          total_tax_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_validation_notes?: Json | null
          ai_validation_status?: string | null
          company_id?: string | null
          created_at?: string | null
          due_date?: string
          filing_type?: string
          id?: string
          interest_amount?: number | null
          penalties_amount?: number | null
          status?: Database["public"]["Enums"]["tax_filing_status"] | null
          submission_date?: string | null
          tax_period_end?: string
          tax_period_start?: string
          total_tax_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_filings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_filings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_fines: {
        Row: {
          assignment_status: string | null
          created_at: string | null
          entry_type: string | null
          fine_amount: number | null
          fine_location: string | null
          fine_type: string | null
          id: string
          lease_id: string | null
          license_plate: string | null
          payment_date: string | null
          payment_reference: string | null
          payment_status: string | null
          serial_number: string | null
          updated_at: string | null
          validation_status: string | null
          vehicle_id: string | null
          violation_charge: string | null
          violation_date: string | null
          violation_number: string | null
          violation_points: number | null
        }
        Insert: {
          assignment_status?: string | null
          created_at?: string | null
          entry_type?: string | null
          fine_amount?: number | null
          fine_location?: string | null
          fine_type?: string | null
          id?: string
          lease_id?: string | null
          license_plate?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          serial_number?: string | null
          updated_at?: string | null
          validation_status?: string | null
          vehicle_id?: string | null
          violation_charge?: string | null
          violation_date?: string | null
          violation_number?: string | null
          violation_points?: number | null
        }
        Update: {
          assignment_status?: string | null
          created_at?: string | null
          entry_type?: string | null
          fine_amount?: number | null
          fine_location?: string | null
          fine_type?: string | null
          id?: string
          lease_id?: string | null
          license_plate?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          serial_number?: string | null
          updated_at?: string | null
          validation_status?: string | null
          vehicle_id?: string | null
          violation_charge?: string | null
          violation_date?: string | null
          violation_number?: string | null
          violation_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_fines_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
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
      transaction_amounts: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          id: string
          month_year: string | null
          payment_method: string | null
          recorded_date: string | null
          transaction_id: string | null
          transaction_reference: string | null
          type: Database["public"]["Enums"]["transaction_amount_type"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          id?: string
          month_year?: string | null
          payment_method?: string | null
          recorded_date?: string | null
          transaction_id?: string | null
          transaction_reference?: string | null
          type?: Database["public"]["Enums"]["transaction_amount_type"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          id?: string
          month_year?: string | null
          payment_method?: string | null
          recorded_date?: string | null
          transaction_id?: string | null
          transaction_reference?: string | null
          type?: Database["public"]["Enums"]["transaction_amount_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_amounts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "raw_transaction_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_import_items: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          description: string | null
          id: string
          import_id: string | null
          lease_id: string | null
          license_plate: string | null
          payment_date: string | null
          payment_method: string | null
          row_number: number | null
          status: string | null
          transaction_date: string
          transaction_id: string | null
          type: string | null
          validation_errors: Json | null
          vehicle: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          import_id?: string | null
          lease_id?: string | null
          license_plate?: string | null
          payment_date?: string | null
          payment_method?: string | null
          row_number?: number | null
          status?: string | null
          transaction_date: string
          transaction_id?: string | null
          type?: string | null
          validation_errors?: Json | null
          vehicle?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          import_id?: string | null
          lease_id?: string | null
          license_plate?: string | null
          payment_date?: string | null
          payment_method?: string | null
          row_number?: number | null
          status?: string | null
          transaction_date?: string
          transaction_id?: string | null
          type?: string | null
          validation_errors?: Json | null
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_import_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "accounting_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_import_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_import_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_import_items_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "transaction_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_import_items_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_import_items_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_imports: {
        Row: {
          amount: number | null
          assignment_details: Json | null
          auto_assigned: boolean | null
          created_at: string | null
          errors: Json | null
          file_name: string
          id: string
          records_processed: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          assignment_details?: Json | null
          auto_assigned?: boolean | null
          created_at?: string | null
          errors?: Json | null
          file_name: string
          id?: string
          records_processed?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          assignment_details?: Json | null
          auto_assigned?: boolean | null
          created_at?: string | null
          errors?: Json | null
          file_name?: string
          id?: string
          records_processed?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_count: number
          id: string
          timestamp: string
        }
        Insert: {
          activity_count?: number
          id?: string
          timestamp?: string
        }
        Update: {
          activity_count?: number
          id?: string
          timestamp?: string
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          updated_at: string | null
          uploaded_by: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          updated_at?: string | null
          uploaded_by?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          updated_at?: string | null
          uploaded_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          ai_confidence_score: number | null
          ai_damage_detection: Json | null
          created_at: string | null
          damage_confidence_score: number | null
          damage_markers: Json | null
          damage_severity: string | null
          detected_damages: Json | null
          fuel_level: number | null
          id: string
          inspection_date: string | null
          inspection_photos: string[] | null
          inspection_type: string
          inspector_notes: string | null
          lease_id: string | null
          maintenance_id: string | null
          odometer_reading: number | null
          photos: string[] | null
          renter_signature: string | null
          staff_signature: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          ai_confidence_score?: number | null
          ai_damage_detection?: Json | null
          created_at?: string | null
          damage_confidence_score?: number | null
          damage_markers?: Json | null
          damage_severity?: string | null
          detected_damages?: Json | null
          fuel_level?: number | null
          id?: string
          inspection_date?: string | null
          inspection_photos?: string[] | null
          inspection_type: string
          inspector_notes?: string | null
          lease_id?: string | null
          maintenance_id?: string | null
          odometer_reading?: number | null
          photos?: string[] | null
          renter_signature?: string | null
          staff_signature?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          ai_confidence_score?: number | null
          ai_damage_detection?: Json | null
          created_at?: string | null
          damage_confidence_score?: number | null
          damage_markers?: Json | null
          damage_severity?: string | null
          detected_damages?: Json | null
          fuel_level?: number | null
          id?: string
          inspection_date?: string | null
          inspection_photos?: string[] | null
          inspection_type?: string
          inspector_notes?: string | null
          lease_id?: string | null
          maintenance_id?: string | null
          odometer_reading?: number | null
          photos?: string[] | null
          renter_signature?: string | null
          staff_signature?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_insurance: {
        Row: {
          coverage_amount: number
          coverage_type: string
          created_at: string | null
          end_date: string
          id: string
          policy_number: string
          premium_amount: number
          provider: string
          start_date: string
          status: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          coverage_amount: number
          coverage_type: string
          created_at?: string | null
          end_date: string
          id?: string
          policy_number: string
          premium_amount: number
          provider: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          coverage_amount?: number
          coverage_type?: string
          created_at?: string | null
          end_date?: string
          id?: string
          policy_number?: string
          premium_amount?: number
          provider?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_insurance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_parts: {
        Row: {
          created_at: string | null
          id: string
          maintenance_id: string | null
          part_name: string
          part_number: string | null
          quantity: number
          status: string | null
          supplier: string | null
          unit_cost: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          maintenance_id?: string | null
          part_name: string
          part_number?: string | null
          quantity?: number
          status?: string | null
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          maintenance_id?: string | null
          part_name?: string
          part_number?: string | null
          quantity?: number
          status?: string | null
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_parts_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_parts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_schedules: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          location_address: string
          location_coordinates: unknown | null
          route_optimization_data: Json | null
          schedule_type: string
          scheduled_time: string
          status: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          location_address: string
          location_coordinates?: unknown | null
          route_optimization_data?: Json | null
          schedule_type: string
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          location_address?: string
          location_coordinates?: unknown | null
          route_optimization_data?: Json | null
          schedule_type?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_sensor_data: {
        Row: {
          battery_health: number | null
          brake_pad_wear: number | null
          check_engine_status: boolean | null
          created_at: string | null
          engine_temperature: number | null
          fuel_level: number | null
          id: string
          mileage: number | null
          oil_life_remaining: number | null
          timestamp: string | null
          tire_pressure: Json | null
          vehicle_id: string
        }
        Insert: {
          battery_health?: number | null
          brake_pad_wear?: number | null
          check_engine_status?: boolean | null
          created_at?: string | null
          engine_temperature?: number | null
          fuel_level?: number | null
          id?: string
          mileage?: number | null
          oil_life_remaining?: number | null
          timestamp?: string | null
          tire_pressure?: Json | null
          vehicle_id: string
        }
        Update: {
          battery_health?: number | null
          brake_pad_wear?: number | null
          check_engine_status?: boolean | null
          created_at?: string | null
          engine_temperature?: number | null
          fuel_level?: number | null
          id?: string
          mileage?: number | null
          oil_life_remaining?: number | null
          timestamp?: string | null
          tire_pressure?: Json | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_sensor_data_vehicle_id_fkey"
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
          insurance_company: string | null
          is_test_data: boolean | null
          license_plate: string
          location: string | null
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
          insurance_company?: string | null
          is_test_data?: boolean | null
          license_plate: string
          location?: string | null
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
          insurance_company?: string | null
          is_test_data?: boolean | null
          license_plate?: string
          location?: string | null
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
      workflow_automation_logs: {
        Row: {
          action_type: string
          details: Json
          executed_at: string | null
          id: string
          status: string
          workflow_instance_id: string | null
        }
        Insert: {
          action_type: string
          details: Json
          executed_at?: string | null
          id?: string
          status: string
          workflow_instance_id?: string | null
        }
        Update: {
          action_type?: string
          details?: Json
          executed_at?: string | null
          id?: string
          status?: string
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_automation_logs_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          case_id: string | null
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          data: Json | null
          id: string
          started_at: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          data?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          data?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json
          triggers: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps?: Json
          triggers?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json
          triggers?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agreement_overview: {
        Row: {
          agreement_number: string | null
          customer_name: string | null
          id: string | null
          next_payment_date: string | null
          payment_status: string | null
          status: Database["public"]["Enums"]["lease_status"] | null
          total_amount: number | null
          total_paid_amount: number | null
          vehicle_details: string | null
        }
        Relationships: []
      }
      customer_statuses: {
        Row: {
          full_name: string | null
          id: string | null
          status: string | null
        }
        Insert: {
          full_name?: string | null
          id?: string | null
          status?: never
        }
        Update: {
          full_name?: string | null
          id?: string | null
          status?: never
        }
        Relationships: []
      }
      overdue_payments_view: {
        Row: {
          agreement_id: string | null
          agreement_number: string | null
          amount_paid: number | null
          balance: number | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          days_overdue: number | null
          id: string | null
          last_payment_date: string | null
          notes: string | null
          status: Database["public"]["Enums"]["overdue_payment_status"] | null
          total_amount: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "overdue_payments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: true
            referencedRelation: "agreement_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_payments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: true
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overdue_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_case_duration_stats: {
        Args: {
          p_case_type: string
          p_time_period: string
        }
        Returns: undefined
      }
      calculate_credit_score: {
        Args: {
          p_monthly_income: number
          p_employment_status: string
          p_debt_to_income_ratio: number
        }
        Returns: number
      }
      calculate_detailed_credit_score: {
        Args: {
          p_monthly_income: number
          p_employment_status: string
          p_debt_to_income_ratio: number
          p_payment_history_score: number
          p_credit_utilization: number
          p_credit_history_length: number
        }
        Returns: Json
      }
      calculate_remaining_amount: {
        Args: {
          lease_id: string
        }
        Returns: number
      }
      calculate_risk_score: {
        Args: {
          p_customer_id: string
        }
        Returns: number
      }
      create_default_agreement_if_not_exists: {
        Args: {
          p_agreement_number: string
          p_customer_name: string
          p_amount: number
        }
        Returns: string
      }
      create_transaction_import: {
        Args: {
          p_file_name: string
        }
        Returns: string
      }
      delete_all_agreements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_all_historical_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_all_transactions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_historical_payments: {
        Args: {
          agreement_id: string
        }
        Returns: undefined
      }
      has_active_agreements: {
        Args: {
          customer_id: string
        }
        Returns: boolean
      }
      is_valid_date: {
        Args: {
          date_str: string
        }
        Returns: boolean
      }
      process_recurring_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_recurring_transactions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_payment_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      swap_day_month: {
        Args: {
          input_date: string
        }
        Returns: string
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
      audit_action_type:
        | "create"
        | "update"
        | "delete"
        | "view"
        | "login"
        | "logout"
        | "export"
        | "import"
        | "payment"
        | "status_change"
        | "document_upload"
      customer_status_type:
        | "active"
        | "inactive"
        | "suspended"
        | "pending_review"
        | "blacklisted"
      damage_severity: "none" | "minor" | "moderate" | "severe"
      discount_type: "percentage" | "fixed_amount"
      document_language: "english" | "spanish" | "french" | "arabic"
      document_version_status: "draft" | "published" | "archived"
      import_status: "pending" | "processing" | "completed" | "failed"
      import_type: "payments" | "customers" | "agreements"
      lease_status:
        | "pending_payment"
        | "pending_deposit"
        | "active"
        | "closed"
        | "terminated"
        | "cancelled"
      legal_case_status:
        | "pending_reminder"
        | "in_legal_process"
        | "resolved"
        | "escalated"
      maintenance_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      overdue_payment_status: "pending" | "partially_paid" | "resolved"
      payment_method_type:
        | "Invoice"
        | "Cash"
        | "WireTransfer"
        | "Cheque"
        | "Deposit"
        | "On_hold"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      tax_filing_status:
        | "pending"
        | "in_progress"
        | "submitted"
        | "accepted"
        | "rejected"
      transaction_amount_type: "income" | "expense" | "refund"
      transaction_type:
        | "LATE_PAYMENT_FEE"
        | "ADMINISTRATIVE_FEES"
        | "VEHICLE_DAMAGE_CHARGE"
        | "TRAFFIC_FINE"
        | "RENTAL_FEE"
        | "ADVANCE_PAYMENT"
        | "OTHER"
        | "INCOME"
        | "EXPENSE"
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
      payment_assignment_result: {
        success: boolean | null
        agreement_number: string | null
        amount_assigned: number | null
        timestamp: string | null
      }
      transaction_form_data: {
        type: string | null
        amount: number | null
        category_id: string | null
        description: string | null
        transaction_date: string | null
        cost_type: string | null
        is_recurring: boolean | null
        payment_method: string | null
        interval_value: number | null
        interval_unit: string | null
      }
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
