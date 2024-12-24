import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from "sonner";

// Define basic types
type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

// Simplified error interface
interface ApiError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Simplified response interface
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  table: TableName,
  data?: Record<string, unknown>,
  id?: string
): Promise<ApiResponse<T>> {
  try {
    const query = supabase.from(table);
    let result: ApiResponse<T>;

    switch (method) {
      case 'GET': {
        if (id) {
          const { data: fetchedData, error } = await query
            .select('*')
            .eq('id', id)
            .maybeSingle();

          result = {
            data: fetchedData as T,
            error: error as ApiError
          };
        } else {
          const { data: fetchedData, error } = await query.select('*');
          result = {
            data: fetchedData as T,
            error: error as ApiError
          };
        }
        break;
      }

      case 'POST': {
        if (!data) throw new Error('Data is required for POST requests');
        const { data: insertedData, error: insertError } = await query
          .insert(data)
          .select()
          .single();
        result = {
          data: insertedData as T,
          error: insertError as ApiError
        };
        break;
      }

      case 'PUT': {
        if (!id) throw new Error('ID is required for PUT requests');
        if (!data) throw new Error('Data is required for PUT requests');
        const { data: updatedData, error: updateError } = await query
          .update(data)
          .eq('id', id)
          .select()
          .single();
        result = {
          data: updatedData as T,
          error: updateError as ApiError
        };
        break;
      }

      case 'DELETE': {
        if (!id) throw new Error('ID is required for DELETE requests');
        const { data: deletedData, error: deleteError } = await query
          .delete()
          .eq('id', id)
          .select()
          .single();
        result = {
          data: deletedData as T,
          error: deleteError as ApiError
        };
        break;
      }

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    if (result.error) {
      console.error(`API Error (${method} ${table}):`, result.error);
      toast.error(`Error: ${result.error.message}`);
    }

    return result;
  } catch (error) {
    console.error(`API Request Failed (${method} ${table}):`, error);
    toast.error('An unexpected error occurred');
    return { 
      data: null, 
      error: error as ApiError 
    };
  }
}

export const apiClient = {
  get: <T>(table: TableName, id?: string) => request<T>('GET', table, undefined, id),
  post: <T>(table: TableName, data: Record<string, unknown>) => request<T>('POST', table, data),
  put: <T>(table: TableName, id: string, data: Record<string, unknown>) => request<T>('PUT', table, data, id),
  delete: <T>(table: TableName, id: string) => request<T>('DELETE', table, undefined, id),
};