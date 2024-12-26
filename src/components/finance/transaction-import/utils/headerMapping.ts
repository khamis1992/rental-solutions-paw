export interface HeaderMapping {
  originalHeader: string;
  mappedHeader: string;
}

export interface SavedMapping {
  id: string;
  mapping_name: string;
  field_mappings: Record<string, string>;
  created_by?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const normalizeHeader = (header: string): string => {
  return header.toLowerCase().trim().replace(/\s+/g, '_');
};

export const getRequiredHeaders = () => [
  'agreement_number',
  'customer_name',
  'amount',
  'license_plate',
  'vehicle',
  'payment_date',
  'payment_method',
  'payment_number',
  'payment_description'
];

export const validateHeaders = (headers: string[], requiredHeaders: string[]) => {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedRequired = requiredHeaders.map(normalizeHeader);
  
  const missingHeaders = normalizedRequired.filter(
    required => !normalizedHeaders.includes(required)
  );
  
  const unmappedHeaders = normalizedHeaders.filter(
    header => !normalizedRequired.includes(header)
  );
  
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
    unmappedHeaders
  };
};

export const suggestHeaderMapping = (header: string, requiredHeaders: string[]): string[] => {
  const normalizedHeader = normalizeHeader(header);
  return requiredHeaders
    .filter(required => {
      const normalizedRequired = normalizeHeader(required);
      return normalizedRequired.includes(normalizedHeader) ||
             normalizedHeader.includes(normalizedRequired);
    })
    .sort((a, b) => {
      // Prioritize exact matches
      const aScore = normalizeHeader(a) === normalizedHeader ? 0 : 1;
      const bScore = normalizeHeader(b) === normalizedHeader ? 0 : 1;
      return aScore - bScore;
    });
};