interface RequestConfig {
  method?: string;
  body?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    try {
      const { method = 'GET', body, params, headers = {} } = config;

      // Log request details in development
      console.log(`API Request: ${method} ${endpoint}`, { body, params });

      // Handle database operations through Supabase
      if (endpoint.startsWith('/db/')) {
        const tableName = endpoint.replace('/db/', '');
        let query = supabase.from(tableName);

        switch (method) {
          case 'GET': {
            const { data, error } = await query.select();
            return { data: data as T, error };
          }
          case 'POST': {
            const { data, error } = await query.insert(body);
            return { data: data as T, error };
          }
          case 'PUT': {
            const { data, error } = await query.update(body).eq('id', body.id);
            return { data: data as T, error };
          }
          case 'DELETE': {
            const { data, error } = await query.delete().eq('id', body.id);
            return { data: data as T, error };
          }
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      }

      // Handle Edge Functions or external API calls
      const url = new URL(endpoint.startsWith('/') ? `${this.baseUrl}${endpoint}` : endpoint);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };

    } catch (error) {
      console.error('API Error:', error);
      toast.error('An error occurred while processing your request');
      return { data: null, error: error as Error };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async delete<T>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', body: { id } });
  }

  // Specialized methods for common operations
  async fetchCustomers<T>(params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.get<T>('/db/profiles', params);
  }

  async fetchRentals<T>(params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.get<T>('/db/leases', params);
  }

  async createPayment<T>(paymentData: any): Promise<ApiResponse<T>> {
    return this.post<T>('/db/payments', paymentData);
  }

  async updateVehicleStatus<T>(vehicleId: string, status: string): Promise<ApiResponse<T>> {
    return this.put<T>('/db/vehicles', { id: vehicleId, status });
  }

  async uploadDocument(file: File, bucket: string): Promise<ApiResponse<any>> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`${Date.now()}-${file.name}`, file);

    if (error) {
      toast.error('Failed to upload document');
      return { data: null, error };
    }

    return { data, error: null };
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();