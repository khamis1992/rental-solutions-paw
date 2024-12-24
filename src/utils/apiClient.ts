import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type Row<T extends TableName> = Tables[T]['Row'];
type Insert<T extends TableName> = Tables[T]['Insert'];
type Update<T extends TableName> = Tables[T]['Update'];

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export const apiClient = {
  async get<T extends TableName>(table: T, id?: string): Promise<ApiResponse<Row<T>>> {
    try {
      const query = supabase.from(table);
      
      if (id) {
        const { data, error } = await query
          .select('*')
          .eq('id', id)
          .maybeSingle();

        return {
          data: data as Row<T> | null,
          error: error as Error | null
        };
      }

      const { data, error } = await query
        .select('*')
        .maybeSingle();

      return {
        data: data as Row<T> | null,
        error: error as Error | null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  },

  async create<T extends TableName>(
    table: T,
    data: Insert<T>
  ): Promise<ApiResponse<Row<T>>> {
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data as Tables[T]['Insert'])
        .select()
        .maybeSingle();

      return {
        data: insertedData as Row<T> | null,
        error: error as Error | null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  },

  async update<T extends TableName>(
    table: T,
    id: string,
    data: Update<T>
  ): Promise<ApiResponse<Row<T>>> {
    try {
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data as Tables[T]['Update'])
        .eq('id', id)
        .select()
        .maybeSingle();

      return {
        data: updatedData as Row<T> | null,
        error: error as Error | null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  },

  async delete<T extends TableName>(table: T, id: string): Promise<ApiResponse<Row<T>>> {
    try {
      const { data: deletedData, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();

      return {
        data: deletedData as Row<T> | null,
        error: error as Error | null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }
};