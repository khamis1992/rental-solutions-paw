import { describe, it, expect } from 'jest';
import { generatePDF } from '../pdfUtils';

describe('PDF Generation', () => {
  const mockAgreement = {
    id: '123',
    agreement_number: 'AGR-001',
    status: 'active' as const,
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    initial_mileage: 50000,
    return_mileage: null,
    total_amount: 5000,
    notes: '',
    agreement_type: 'short_term' as const,
    rent_amount: 500,
    rent_due_day: 1,
    customer: {
      id: 'cust-123',
      full_name: 'John Doe',
      phone_number: '1234567890',
      address: '123 Main St'
    },
    vehicle: {
      id: 'veh-123',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      license_plate: 'ABC123'
    },
    vehicle_id: 'veh-123',
    customer_id: 'cust-123'
  };

  it('should generate PDF with correct customer information', () => {
    const pdf = generatePDF(mockAgreement);
    expect(pdf).toBeDefined();
    expect(pdf.includes(mockAgreement.customer.full_name)).toBeTruthy();
  });

  it('should include vehicle details in PDF', () => {
    const pdf = generatePDF(mockAgreement);
    expect(pdf.includes(mockAgreement.vehicle.make)).toBeTruthy();
    expect(pdf.includes(mockAgreement.vehicle.model)).toBeTruthy();
  });
});