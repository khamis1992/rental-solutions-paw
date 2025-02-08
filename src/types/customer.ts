
export interface Customer {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  driver_license: string | null;
  id_document_url?: string | null;
  license_document_url?: string | null;
  contract_document_url?: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  nationality?: string | null;
}
