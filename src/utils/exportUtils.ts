import { Agreement } from "@/types/agreement";
import { Customer } from "@/types/customer";
import { formatCurrency } from "@/lib/utils";

type ExportableDataType = 'customers' | 'agreements' | 'financial';

interface ExportOptions {
  format: 'csv';
  filename?: string;
}

/**
 * Convert array of objects to CSV string
 */
const objectToCSV = (data: any[], headers: { [key: string]: string }) => {
  // Create header row
  const headerRow = Object.values(headers).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return Object.keys(headers).map(key => {
      const value = item[key];
      // Handle special cases (null, undefined, objects)
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      // Escape commas and quotes in strings
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return value;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Format customer data for export
 */
const formatCustomerData = (customers: Customer[]) => {
  const headers = {
    full_name: 'Full Name',
    phone_number: 'Phone Number',
    email: 'Email',
    address: 'Address',
    driver_license: 'Driver License',
    created_at: 'Created Date'
  };

  return objectToCSV(customers, headers);
};

/**
 * Format agreement data for export
 */
const formatAgreementData = (agreements: Agreement[]) => {
  const headers = {
    agreement_number: 'Agreement Number',
    customer: 'Customer',
    vehicle: 'Vehicle',
    start_date: 'Start Date',
    end_date: 'End Date',
    total_amount: 'Total Amount',
    status: 'Status'
  };

  const formattedData = agreements.map(agreement => ({
    agreement_number: agreement.agreement_number,
    customer: agreement.customer?.full_name || '',
    vehicle: `${agreement.vehicle?.make} ${agreement.vehicle?.model} (${agreement.vehicle?.license_plate})`,
    start_date: agreement.start_date,
    end_date: agreement.end_date,
    total_amount: formatCurrency(agreement.total_amount),
    status: agreement.status
  }));

  return objectToCSV(formattedData, headers);
};

/**
 * Format financial data for export
 */
const formatFinancialData = (transactions: any[]) => {
  const headers = {
    date: 'Date',
    type: 'Type',
    category: 'Category',
    amount: 'Amount',
    description: 'Description',
    status: 'Status'
  };

  const formattedData = transactions.map(transaction => ({
    date: transaction.transaction_date,
    type: transaction.type,
    category: transaction.accounting_categories?.name || 'Uncategorized',
    amount: formatCurrency(transaction.amount),
    description: transaction.description,
    status: transaction.status
  }));

  return objectToCSV(formattedData, headers);
};

/**
 * Export data to CSV file
 */
export const exportData = async (
  type: ExportableDataType,
  data: any[],
  options: ExportOptions = { format: 'csv' }
) => {
  try {
    let csvContent: string;
    const timestamp = new Date().toISOString().split('T')[0];

    // Format data based on type
    switch (type) {
      case 'customers':
        csvContent = formatCustomerData(data);
        options.filename = options.filename || `customers-${timestamp}.csv`;
        break;
      case 'agreements':
        csvContent = formatAgreementData(data);
        options.filename = options.filename || `agreements-${timestamp}.csv`;
        break;
      case 'financial':
        csvContent = formatFinancialData(data);
        options.filename = options.filename || `financial-records-${timestamp}.csv`;
        break;
      default:
        throw new Error('Invalid export type');
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', options.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};
