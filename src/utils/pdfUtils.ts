import { jsPDF } from 'jspdf';
import { Agreement } from '@/types/agreement';
import { formatDateToDisplay } from '@/components/agreements/utils/dateUtils';

interface PDFGenerationOptions {
  includeHeader?: boolean;
  includeLogo?: boolean;
  fontSize?: number;
  lineSpacing?: number;
}

export const generatePDF = async (
  agreement: Agreement,
  options: PDFGenerationOptions = {}
): Promise<Blob> => {
  const {
    includeHeader = true,
    includeLogo = true,
    fontSize = 12,
    lineSpacing = 10,
  } = options;

  // Initialize PDF document
  const doc = new jsPDF();
  let yPosition = 20;

  // Set default font size
  doc.setFontSize(fontSize);

  // Add company logo if requested
  if (includeLogo) {
    try {
      const response = await fetch('/lovable-uploads/company-logo.png');
      const blob = await response.blob();
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onload = () => {
          if (reader.result) {
            doc.addImage(reader.result as string, 'PNG', 15, yPosition, 40, 20);
            resolve(null);
          }
        };
        reader.readAsDataURL(blob);
      });
      
      yPosition += 30;
    } catch (error) {
      console.error('Error loading company logo:', error);
    }
  }

  // Add header if requested
  if (includeHeader) {
    doc.setFontSize(fontSize + 4);
    doc.text('RENTAL AGREEMENT', 105, yPosition, { align: 'center' });
    doc.setFontSize(fontSize);
    yPosition += lineSpacing * 2;
  }

  // Agreement Details
  doc.text(`Agreement Number: ${agreement.agreement_number || ''}`, 20, yPosition);
  yPosition += lineSpacing;

  doc.text(`Status: ${agreement.status}`, 20, yPosition);
  yPosition += lineSpacing;

  doc.text(`Start Date: ${formatDateToDisplay(agreement.start_date)}`, 20, yPosition);
  yPosition += lineSpacing;

  doc.text(`End Date: ${formatDateToDisplay(agreement.end_date)}`, 20, yPosition);
  yPosition += lineSpacing * 2;

  // Customer Information
  doc.setFontSize(fontSize + 2);
  doc.text('Customer Information', 20, yPosition);
  doc.setFontSize(fontSize);
  yPosition += lineSpacing;

  if (agreement.customer) {
    doc.text(`Name: ${agreement.customer.full_name || ''}`, 20, yPosition);
    yPosition += lineSpacing;
    doc.text(`Phone: ${agreement.customer.phone_number || ''}`, 20, yPosition);
    yPosition += lineSpacing;
    doc.text(`Address: ${agreement.customer.address || ''}`, 20, yPosition);
    yPosition += lineSpacing * 2;
  }

  // Vehicle Information
  doc.setFontSize(fontSize + 2);
  doc.text('Vehicle Information', 20, yPosition);
  doc.setFontSize(fontSize);
  yPosition += lineSpacing;

  if (agreement.vehicle) {
    doc.text(
      `Vehicle: ${agreement.vehicle.year} ${agreement.vehicle.make} ${agreement.vehicle.model}`,
      20,
      yPosition
    );
    yPosition += lineSpacing;
    doc.text(`License Plate: ${agreement.vehicle.license_plate}`, 20, yPosition);
    yPosition += lineSpacing;
  }

  // Payment Information
  doc.setFontSize(fontSize + 2);
  yPosition += lineSpacing;
  doc.text('Payment Information', 20, yPosition);
  doc.setFontSize(fontSize);
  yPosition += lineSpacing;

  doc.text(`Initial Mileage: ${agreement.initial_mileage}`, 20, yPosition);
  yPosition += lineSpacing;
  doc.text(`Total Amount: ${agreement.total_amount} QAR`, 20, yPosition);
  yPosition += lineSpacing * 2;

  // Signature Lines
  yPosition = doc.internal.pageSize.height - 50;
  
  doc.line(20, yPosition, 90, yPosition);
  doc.line(120, yPosition, 190, yPosition);
  yPosition += 5;
  
  doc.text('Customer Signature', 20, yPosition);
  doc.text('Company Representative', 120, yPosition);

  // Return the PDF as a blob
  return doc.output('blob');
};

export const downloadPDF = async (
  agreement: Agreement,
  options?: PDFGenerationOptions
): Promise<void> => {
  try {
    const pdfBlob = await generatePDF(agreement, options);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rental-agreement-${agreement.agreement_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};