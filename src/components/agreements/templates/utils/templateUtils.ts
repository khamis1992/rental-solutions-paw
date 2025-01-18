import { AgreementWithRelations } from "@/types/agreement.types";
import { Vehicle } from "@/types/vehicle";
import { Customer } from "@/types/customer";

interface TemplateData {
  agreement: AgreementWithRelations;
  vehicle?: Vehicle;
  customer?: Customer;
}

export const validateTemplate = (template: string): string[] => {
  const missingVariables: string[] = [];
  const regex = /{{([^}]+)}}/g;
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variable = match[1];
    missingVariables.push(variable);
  }

  return missingVariables;
};

export const replaceTemplateVariables = (template: string, data: TemplateData): string => {
  if (!template) return '';

  const { agreement, vehicle, customer } = data;

  // Format currency values
  const formatCurrency = (value: number) => 
    `${value?.toLocaleString()} QAR`;

  // Define variable mappings
  const variableMappings: Record<string, string> = {
    // Agreement variables
    'agreement.agreement_number': agreement.agreement_number || '',
    'agreement.agreement_type': agreement.agreement_type || '',
    'agreement.start_date': agreement.start_date ? new Date(agreement.start_date).toLocaleDateString('en-GB') : '',
    'agreement.end_date': agreement.end_date ? new Date(agreement.end_date).toLocaleDateString('en-GB') : '',
    'agreement.rent_amount': formatCurrency(agreement.rent_amount || 0),
    'agreement.total_amount': formatCurrency(agreement.total_amount || 0),
    'agreement.daily_late_fee': formatCurrency(agreement.daily_late_fee || 120),

    // Vehicle variables
    'vehicle.make': vehicle?.make || '',
    'vehicle.model': vehicle?.model || '',
    'vehicle.year': vehicle?.year?.toString() || '',
    'vehicle.color': vehicle?.color || '',
    'vehicle.license_plate': vehicle?.license_plate || '',
    'vehicle.vin': vehicle?.vin || '',

    // Customer variables
    'customer.full_name': customer?.full_name || '',
    'customer.phone_number': customer?.phone_number || '',
    'customer.address': customer?.address || '',
    'customer.nationality': customer?.nationality || '',
    'customer.email': customer?.email || '',
  };

  // Replace all variables in template
  let result = template;
  Object.entries(variableMappings).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
};