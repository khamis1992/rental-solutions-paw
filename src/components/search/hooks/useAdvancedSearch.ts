import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SearchFilters } from '../types/search.types';

export function useAdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    entityType: 'all',
    keyword: '',
  });

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = async () => {
    setIsLoading(true);
    try {
      let query;

      switch (filters.entityType) {
        case 'customer':
          query = supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', `%${filters.keyword}%`);
          break;

        case 'vehicle':
          query = supabase
            .from('vehicles')
            .select('*')
            .or(`make.ilike.%${filters.keyword}%,model.ilike.%${filters.keyword}%,license_plate.ilike.%${filters.keyword}%`);
          break;

        case 'agreement':
          query = supabase
            .from('leases')
            .select(`
              *,
              customer:profiles(full_name),
              vehicle:vehicles(make, model)
            `)
            .or(`agreement_number.ilike.%${filters.keyword}%`);
          break;

        default:
          // Search across all entities
          const [customers, vehicles, agreements] = await Promise.all([
            supabase
              .from('profiles')
              .select('*')
              .ilike('full_name', `%${filters.keyword}%`),
            supabase
              .from('vehicles')
              .select('*')
              .or(`make.ilike.%${filters.keyword}%,model.ilike.%${filters.keyword}%`),
            supabase
              .from('leases')
              .select('*, customer:profiles(full_name)')
              .ilike('agreement_number', `%${filters.keyword}%`)
          ]);

          setResults([
            ...(customers.data || []),
            ...(vehicles.data || []),
            ...(agreements.data || [])
          ]);
          setIsLoading(false);
          return;
      }

      const { data, error } = await query;
      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    filters,
    setFilters,
    results,
    isLoading,
    search
  };
}