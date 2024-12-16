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
      leases: {
        Row: {
          created_at: string
          customer_id: string
          end_date: string
          id: string
          initial_mileage: number
          notes: string | null
          return_mileage: number | null
          start_date: string
          status: Database["public"]["Enums"]["lease_status"] | null
          total_amount: number
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          end_date: string
          id?: string
          initial_mileage: number
          notes?: string | null
          return_mileage?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["lease_status"] | null
          total_amount: number
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          end_date?: string
          id?: string
          initial_mileage?: number
          notes?: string | null
          return_mileage?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["lease_status"] | null
          total_amount?: number
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
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          lease_id: string
          payment_date: string | null
          payment_method: string | null
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
          payment_method?: string | null
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
          payment_method?: string | null
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
          created_at: string
          driver_license: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          driver_license?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          driver_license?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          daily_rate: number
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
          daily_rate: number
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
          daily_rate?: number
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
    }
    Enums: {
      lease_status: "pending" | "active" | "completed" | "cancelled"
      maintenance_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "admin" | "staff" | "customer" | "manager"
      vehicle_status: "available" | "rented" | "maintenance" | "retired"
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
