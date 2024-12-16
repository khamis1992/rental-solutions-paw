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
      damages: {
        Row: {
          description: string
          id: string
          lease_id: string | null
          location: string
          repair_estimate: number | null
          reported_at: string
          status: string | null
        }
        Insert: {
          description: string
          id?: string
          lease_id?: string | null
          location: string
          repair_estimate?: number | null
          reported_at?: string
          status?: string | null
        }
        Update: {
          description?: string
          id?: string
          lease_id?: string | null
          location?: string
          repair_estimate?: number | null
          reported_at?: string
          status?: string | null
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
          end_date: string
          id: string
          monthly_payment: number
          start_date: string
          status: Database["public"]["Enums"]["lease_status"] | null
          total_amount: number
          updated_at: string
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          monthly_payment: number
          start_date: string
          status?: Database["public"]["Enums"]["lease_status"] | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          monthly_payment?: number
          start_date?: string
          status?: Database["public"]["Enums"]["lease_status"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leases_user_id_fkey"
            columns: ["user_id"]
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
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          lease_id: string | null
          payment_date: string
          payment_method: string
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          lease_id?: string | null
          payment_date: string
          payment_method: string
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          lease_id?: string | null
          payment_date?: string
          payment_method?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
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
      profiles: {
        Row: {
          address: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          daily_rate: number
          id: string
          license_plate: string
          make: string
          mileage: number
          model: string
          status: string
          updated_at: string
          vin: string
          year: number
        }
        Insert: {
          created_at?: string
          daily_rate: number
          id?: string
          license_plate: string
          make: string
          mileage?: number
          model: string
          status?: string
          updated_at?: string
          vin: string
          year: number
        }
        Update: {
          created_at?: string
          daily_rate?: number
          id?: string
          license_plate?: string
          make?: string
          mileage?: number
          model?: string
          status?: string
          updated_at?: string
          vin?: string
          year?: number
        }
        Relationships: []
      }
      violations: {
        Row: {
          created_at: string
          description: string
          fine_amount: number
          id: string
          lease_id: string | null
          status: string | null
          violation_date: string
        }
        Insert: {
          created_at?: string
          description: string
          fine_amount: number
          id?: string
          lease_id?: string | null
          status?: string | null
          violation_date: string
        }
        Update: {
          created_at?: string
          description?: string
          fine_amount?: number
          id?: string
          lease_id?: string | null
          status?: string | null
          violation_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "violations_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lease_status: "active" | "completed" | "defaulted" | "pending"
      payment_status: "paid" | "pending" | "overdue" | "partial"
      user_role: "admin" | "manager" | "staff" | "customer"
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
