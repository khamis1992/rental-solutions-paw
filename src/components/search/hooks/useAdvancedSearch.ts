import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SearchFilters, SearchResult } from '../types/search.types';
import { toast } from 'sonner';

export function useAdvancedSearch(filters: SearchFilters) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const search = async () => {
      if (!filters.keyword) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let query;

        switch (filters.entityType) {
          case 'customer':
            const { data: customers, error: customerError } = await supabase
              .from('profiles')
              .select('id, full_name, phone_number')
              .ilike('full_name', `%${filters.keyword}%`);

            if (customerError) throw customerError;
            setResults(customers || []);
            break;

          case 'vehicle':
            const { data: vehicles, error: vehicleError } = await supabase
              .from('vehicles')
              .select('id, make, model, year, license_plate')
              .or(`make.ilike.%${filters.keyword}%,model.ilike.%${filters.keyword}%,license_plate.ilike.%${filters.keyword}%`);

            if (vehicleError) throw vehicleError;
            setResults(vehicles || []);
            break;

          case 'agreement':
            const { data: agreements, error: agreementError } = await supabase
              .from('leases')
              .select('id, agreement_number, status')
              .ilike('agreement_number', `%${filters.keyword}%`);

            if (agreementError) throw agreementError;
            setResults(agreements || []);
            break;

          case 'all':
            const [customersAll, vehiclesAll, agreementsAll] = await Promise.all([
              supabase
                .from('profiles')
                .select('id, full_name, phone_number')
                .ilike('full_name', `%${filters.keyword}%`),
              supabase
                .from('vehicles')
                .select('id, make, model, year, license_plate')
                .or(`make.ilike.%${filters.keyword}%,model.ilike.%${filters.keyword}%`),
              supabase
                .from('leases')
                .select('id, agreement_number, status')
                .ilike('agreement_number', `%${filters.keyword}%`)
            ]);

            setResults([
              ...(customersAll.data || []),
              ...(vehiclesAll.data || []),
              ...(agreementsAll.data || [])
            ]);
            break;
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err as Error);
        toast.error('Failed to perform search');
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [filters]);

  return {
    results,
    isLoading,
    error
  };
}