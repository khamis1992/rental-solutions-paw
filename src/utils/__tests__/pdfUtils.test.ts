import { generatePDF } from '../pdfUtils';
import { Agreement } from '@/types/agreement';

describe('PDF Generation Utilities', () => {
  const mockAgreement: Agreement = {
    id: '123',
    agreement_number: 'AGR-2024-001',
    status: 'active',
    start_date: '2024-03-20T00:00:00Z',
    end_date: '2024-04-20T00:00:00Z',
    initial_mileage: 50000,
    total_amount: 5000,
    return_mileage: 0,
    notes: '',
    agreement_type: 'short_term',
    rent_amount: 1000,
    rent_due_day: 1,
    customer: {
      id: '456',
      full_name: 'John Doe',
      phone_number: '+1234567890',
      address: '123 Main St'
    },
    vehicle: {
      id: '789',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      license_plate: 'ABC123'
    },
    vehicle_id: '789',
    customer_id: '456'
  };

  it('should generate a PDF blob', async () => {
    const pdfBlob = await generatePDF(mockAgreement);
    expect(pdfBlob).toBeInstanceOf(Blob);
    expect(pdfBlob.type).toBe('application/pdf');
  });

  it('should generate PDF with custom options', async () => {
    const pdfBlob = await generatePDF(mockAgreement, {
      includeHeader: false,
      includeLogo: false,
      fontSize: 14,
      lineSpacing: 12
    });
    expect(pdfBlob).toBeInstanceOf(Blob);
    expect(pdfBlob.type).toBe('application/pdf');
  });
});