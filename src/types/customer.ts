export interface Customer {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  driver_license: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  contract_document_url: string | null;
  created_at: string;
  role: 'customer' | 'staff' | 'admin';
  nationality: string | null;
  email: string | null;
  status?: string;
  status_updated_at?: string;
  status_notes?: string;
}