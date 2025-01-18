import { UseFormSetValue } from "react-hook-form";

export interface AgreementFormData {
  address: string;
  email: string;
  notes: string;
  nationality: string;
  vehicleId: string;
  customerId: string;
  rentAmount: number;
  agreementType: string;
  initialMileage: number;
  agreementNumber: string;
  drivingLicense: string;
  phoneNumber: string;
  fullName: string;
  startDate: string;
  endDate: string;
  dailyLateFee: number;
  damagePenaltyRate: number;
  lateReturnFee: number;
}

export type AgreementFormSetValue = UseFormSetValue<AgreementFormData>;