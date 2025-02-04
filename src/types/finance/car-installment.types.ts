export interface CarInstallmentContract {
  id: string;
  car_type: string;
  category: string;
  model_year: number;
  price_per_car: number;
  total_contract_value: number;
  amount_paid: number;
  amount_pending: number;
  total_installments: number;
  remaining_installments: number;
  installment_value: number;
  created_at: string;
  updated_at: string;
  number_of_cars: number;
}

export interface CarInstallmentPayment {
  id: string;
  contract_id: string;
  cheque_number: string;
  amount: number;
  payment_date: string;
  drawee_bank: string;
  paid_amount: number;
  remaining_amount: number;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CarInstallmentAnalyticsProps {
  contract: CarInstallmentContract;
  payments: CarInstallmentPayment[];
}

export interface CarInstallmentPaymentsProps {
  contractId: string;
  payments: CarInstallmentPayment[];
}

export interface PaymentMonitoringProps {
  contract: CarInstallmentContract;
  payments: CarInstallmentPayment[];
}