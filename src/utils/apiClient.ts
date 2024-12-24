import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

async function request<T>(
  method: string,
  table: TableName,
  data?: any,
  id?: string
): Promise<ApiResponse<T>> {
  try {
    let query = supabase.from(table);

    switch (method) {
      case 'GET':
        if (id) {
          const { data: result, error } = await query
            .select('*')
            .eq('id', id)
            .maybeSingle();
          return { 
            data: result as unknown as T, 
            error: error as Error | null 
          };
        } else {
          const { data: result, error } = await query.select('*');
          return { 
            data: result as unknown as T, 
            error: error as Error | null 
          };
        }

      case 'POST':
        const { data: insertedData, error: insertError } = await query
          .insert(data)
          .select()
          .single();
        return { 
          data: insertedData as unknown as T, 
          error: insertError as Error | null 
        };

      case 'PUT':
        if (!id) throw new Error('ID is required for PUT requests');
        const { data: updatedData, error: updateError } = await query
          .update(data)
          .eq('id', id)
          .select()
          .single();
        return { 
          data: updatedData as unknown as T, 
          error: updateError as Error | null 
        };

      case 'DELETE':
        if (!id) throw new Error('ID is required for DELETE requests');
        const { data: deletedData, error: deleteError } = await query
          .delete()
          .eq('id', id)
          .select()
          .single();
        return { 
          data: deletedData as unknown as T, 
          error: deleteError as Error | null 
        };

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export const apiClient = {
  get: <T>(table: TableName, id?: string) => request<T>('GET', table, undefined, id),
  post: <T>(table: TableName, data: any) => request<T>('POST', table, data),
  put: <T>(table: TableName, id: string, data: any) => request<T>('PUT', table, data, id),
  delete: <T>(table: TableName, id: string) => request<T>('DELETE', table, undefined, id),
};