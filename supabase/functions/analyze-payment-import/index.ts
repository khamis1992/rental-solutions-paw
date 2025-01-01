import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const repairDate = (dateStr: string): { value: string; wasRepaired: boolean; error?: string } => {
  try {
    // Handle different date formats
    const cleanDate = dateStr.trim().replace(/['"]/g, '');
    
    // Try DD-MM-YYYY format
    const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (ddmmyyyy.test(cleanDate)) {
      return { value: cleanDate, wasRepaired: false };
    }

    // Try DD/MM/YYYY format
    const ddmmyyyySlash = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (ddmmyyyySlash.test(cleanDate)) {
      const [day, month, year] = cleanDate.split('/');
      return { 
        value: `${day}-${month}-${year}`, 
        wasRepaired: true 
      };
    }

    // Try YYYY-MM-DD format
    const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (yyyymmdd.test(cleanDate)) {
      const [year, month, day] = cleanDate.split('-');
      return { 
        value: `${day}-${month}-${year}`, 
        wasRepaired: true 
      };
    }

    return { 
      value: dateStr, 
      wasRepaired: false, 
      error: 'Invalid date format. Expected DD-MM-YYYY' 
    };
  } catch (error) {
    return { 
      value: dateStr, 
      wasRepaired: false, 
      error: 'Date parsing error' 
    };
  }
};

const repairAmount = (amount: string): { value: string; wasRepaired: boolean; error?: string } => {
  try {
    // Remove any currency symbols and spaces
    const cleanAmount = amount.trim().replace(/[^\d.-]/g, '');
    
    // Parse as float to validate
    const numAmount = parseFloat(cleanAmount);
    if (isNaN(numAmount)) {
      return { 
        value: amount, 
        wasRepaired: false, 
        error: 'Invalid amount format' 
      };
    }

    return { 
      value: numAmount.toString(), 
      wasRepaired: cleanAmount !== amount 
    };
  } catch (error) {
    return { 
      value: amount, 
      wasRepaired: false, 
      error: 'Amount parsing error' 
    };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment import analysis...');
    
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const csvContent = await file.text();
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const requiredFields = [
      'Amount',
      'Payment_Date',
      'Payment_Method',
      'Status',
      'Description',
      'Transaction_ID',
      'Lease_ID'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !headers.some(h => h.toLowerCase() === field.toLowerCase())
    );

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(', ')}`,
          issues: [`The CSV file is missing the following required fields: ${missingFields.join(', ')}`],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Parse and analyze the data
    const rows = lines.slice(1).filter(line => line.trim() !== '');
    let validRows = 0;
    let invalidRows = 0;
    let totalAmount = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];
    const repairedData: any[] = [];

    // Get column indices
    const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
    const dateIndex = headers.findIndex(h => h.toLowerCase() === 'payment_date');
    const methodIndex = headers.findIndex(h => h.toLowerCase() === 'payment_method');
    const statusIndex = headers.findIndex(h => h.toLowerCase() === 'status');

    rows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      const rowNumber = index + 2; // Account for header row and 0-based index
      
      if (values.length !== headers.length) {
        invalidRows++;
        issues.push(`Row ${rowNumber}: Invalid number of columns`);
        return;
      }

      // Create repaired row object
      const repairedRow: Record<string, any> = {};
      let rowIsValid = true;

      // Repair and validate amount
      const amountRepair = repairAmount(values[amountIndex]);
      if (amountRepair.error) {
        invalidRows++;
        issues.push(`Row ${rowNumber}: ${amountRepair.error}`);
        rowIsValid = false;
      } else {
        repairedRow['Amount'] = amountRepair.value;
        if (amountRepair.wasRepaired) {
          suggestions.push(`Row ${rowNumber}: Amount format was automatically fixed`);
        }
        totalAmount += parseFloat(amountRepair.value);
      }

      // Repair and validate date
      const dateRepair = repairDate(values[dateIndex]);
      if (dateRepair.error) {
        invalidRows++;
        issues.push(`Row ${rowNumber}: ${dateRepair.error}`);
        rowIsValid = false;
      } else {
        repairedRow['Payment_Date'] = dateRepair.value;
        if (dateRepair.wasRepaired) {
          suggestions.push(`Row ${rowNumber}: Date format was automatically converted to DD-MM-YYYY`);
        }
      }

      // Validate payment method
      const method = values[methodIndex]?.toLowerCase();
      if (!['cash', 'credit_card', 'bank_transfer', 'cheque'].includes(method)) {
        invalidRows++;
        issues.push(`Row ${rowNumber}: Invalid payment method`);
        rowIsValid = false;
      } else {
        repairedRow['Payment_Method'] = method;
      }

      // Validate status
      const status = values[statusIndex]?.toLowerCase();
      if (!['pending', 'completed', 'failed'].includes(status)) {
        invalidRows++;
        issues.push(`Row ${rowNumber}: Invalid status`);
        rowIsValid = false;
      } else {
        repairedRow['Status'] = status;
      }

      // Add other fields
      headers.forEach((header, idx) => {
        if (idx !== amountIndex && idx !== dateIndex && 
            idx !== methodIndex && idx !== statusIndex) {
          repairedRow[header] = values[idx];
        }
      });

      if (rowIsValid) {
        validRows++;
        repairedData.push(repairedRow);
      }
    });

    // Add general suggestions based on analysis
    if (invalidRows > 0) {
      suggestions.push('Please review and correct the invalid entries before importing');
    }
    if (validRows === 0) {
      suggestions.push('No valid rows found in the file');
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({
        totalRows: rows.length,
        validRows,
        invalidRows,
        totalAmount,
        issues,
        suggestions,
        repairedData,
        success: invalidRows === 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});