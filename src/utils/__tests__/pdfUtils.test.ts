import { generatePDF } from '../pdfUtils';
import type { Agreement } from '@/types/agreement';

describe('pdfUtils', () => {
  const mockAgreement: Agreement = {
    id: '123',
    agreement_number: 'AGR-001',
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    initial_mileage: 50000,
    return_mileage: null,
    total_amount: 5000,
    notes: '',
    agreement_type: 'short_term',
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

  it('should generate PDF with customer information', async () => {
    const pdfBlob = await generatePDF(mockAgreement);
    const pdfText = await pdfBlob.text();
    
    expect(pdfText).toContain('John Doe');
    expect(pdfText).toContain('1234567890');
    expect(pdfText).toContain('123 Main St');
  });

  it('should generate PDF with vehicle information', async () => {
    const pdfBlob = await generatePDF(mockAgreement);
    const pdfText = await pdfBlob.text();
    
    expect(pdfText).toContain('Toyota');
    expect(pdfText).toContain('Camry');
    expect(pdfText).toContain('ABC123');
  });
});