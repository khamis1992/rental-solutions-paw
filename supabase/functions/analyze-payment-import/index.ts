import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }

  try {
    console.log('Starting payment analysis...');
    
    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file provided or invalid file format');
    }

    // Read the file content
    const fileContent = await file.text();
    const lines = fileContent.split('\n').map(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['Amount', 'Payment_Date', 'Payment_Method', 'Status', 'Lease_ID'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    // Analyze the data
    const analysis = {
      totalRows: lines.length - 1,
      validRows: 0,
      invalidRows: 0,
      totalAmount: 0,
      issues: [],
      suggestions: []
    };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const rowData = headers.reduce((obj: any, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});

      // Validate amount
      const amount = parseFloat(rowData.Amount);
      if (isNaN(amount)) {
        analysis.invalidRows++;
        analysis.issues.push(`Row ${i}: Invalid amount format`);
      } else {
        analysis.totalAmount += amount;
      }

      // Validate date
      const date = new Date(rowData.Payment_Date);
      if (isNaN(date.getTime())) {
        analysis.invalidRows++;
        analysis.issues.push(`Row ${i}: Invalid date format`);
      }

      // Validate Lease_ID
      if (!rowData.Lease_ID) {
        analysis.invalidRows++;
        analysis.issues.push(`Row ${i}: Missing Lease_ID`);
      }

      if (!analysis.issues.some(issue => issue.includes(`Row ${i}:`))) {
        analysis.validRows++;
      }
    }

    // Add suggestions based on analysis
    if (analysis.invalidRows > 0) {
      analysis.suggestions.push('Please fix the invalid rows before proceeding with the import.');
    }
    if (analysis.totalAmount === 0) {
      analysis.suggestions.push('Warning: Total payment amount is 0. Please verify if this is correct.');
    }

    console.log('Analysis completed:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing payment analysis:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to analyze payment file',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});