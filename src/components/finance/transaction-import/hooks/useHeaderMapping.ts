import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateHeaders, normalizeHeader } from '../utils/headerMapping';
import type { SavedMapping } from '../utils/headerMapping';

export const useHeaderMapping = () => {
  const [savedMappings, setSavedMappings] = useState<SavedMapping[]>([]);

  const loadSavedMappings = useCallback(async () => {
    const { data, error } = await supabase
      .from('csv_import_mappings')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error loading saved mappings:', error);
      return;
    }

    setSavedMappings(data);
  }, []);

  const applyMapping = useCallback((headers: string[], mapping: Record<string, string>) => {
    return headers.map(header => {
      const normalizedHeader = normalizeHeader(header);
      return mapping[normalizedHeader] || normalizedHeader;
    });
  }, []);

  const validateAndMapHeaders = useCallback((headers: string[], requiredHeaders: string[]) => {
    const validation = validateHeaders(headers, requiredHeaders);
    
    if (validation.isValid) {
      return {
        isValid: true,
        headers: headers.map(normalizeHeader),
        unmappedHeaders: []
      };
    }

    return {
      isValid: false,
      headers: [],
      ...validation
    };
  }, []);

  return {
    savedMappings,
    loadSavedMappings,
    applyMapping,
    validateAndMapHeaders
  };
};