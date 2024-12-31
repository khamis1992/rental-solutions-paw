import { supabase } from "@/integrations/supabase/client";

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ReportConfig {
  reportName: string;
  selectedFields: string[];
  filters: ReportFilter[];
  chartType: string;
}

export const generateReport = async (config: ReportConfig) => {
  try {
    // Start building the query
    let query = supabase
      .from('legal_cases')
      .select(config.selectedFields.join(','));

    // Apply filters
    config.filters.forEach((filter) => {
      switch (filter.operator) {
        case 'equals':
          query = query.eq(filter.field, filter.value);
          break;
        case 'contains':
          query = query.ilike(filter.field, `%${filter.value}%`);
          break;
        case 'greater_than':
          query = query.gt(filter.field, filter.value);
          break;
        case 'less_than':
          query = query.lt(filter.field, filter.value);
          break;
      }
    });

    const { data, error } = await query;

    if (error) throw error;

    return {
      name: config.reportName,
      data: data || [],
      chartType: config.chartType,
      fields: config.selectedFields,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const exportReport = async (reportData: any, format: 'csv' | 'pdf') => {
  if (format === 'csv') {
    const csvContent = reportData.data.map((row: any) => {
      return reportData.fields
        .map((field: string) => row[field])
        .join(',');
    });
    
    const header = reportData.fields.join(',');
    const csv = [header, ...csvContent].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportData.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  // PDF export can be implemented later with a library like pdfmake
};