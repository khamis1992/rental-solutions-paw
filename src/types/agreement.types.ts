export interface AgreementWithRelations {
  id: string;
  agreement_number: string | null;
  agreement_type: "lease_to_own" | "short_term";
  start_date: string | null;
  end_date: string | null;
  rent_amount: number;
  total_amount: number;
  daily_late_fee: number;
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    address: string | null;
    nationality: string | null;
    email: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}