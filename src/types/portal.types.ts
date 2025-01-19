export interface PortalLoginResponse {
  success: boolean;
  message?: string;
  user?: {
    agreement_number: string;
    status: string;
    customer_name: string;
    phone_number: string;
  };
}