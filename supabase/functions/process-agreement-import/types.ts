export interface ImportRequest {
  fileName: string;
}

export interface AgreementData {
  agreement_number: string;
  license_no: string;
  full_name: string;
  license_number: string;
  checkout_date: string | null;
  checkin_date: string | null;
  return_date: string | null;
  status: string;
}

export interface BatchError {
  rows: string;
  error: string;
}