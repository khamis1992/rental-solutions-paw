import { supabase } from "@/integrations/supabase/client";
import { UnifiedImportTracking } from "../../types/transaction.types";

export const analyzePayment = async (payment: UnifiedImportTracking) => {
  const { data: analysisResult, error: analysisError } = await supabase.functions
    .invoke('analyze-payment-import', {
      body: { payment }
    });

  if (analysisError) {
    console.error('Analysis error:', analysisError);
    throw new Error(`Failed to analyze payment: ${analysisError.message}`);
  }

  return analysisResult;
};

export const findStuckPayments = async () => {
  const { data: stuckPayments, error: fetchError } = await supabase
    .from('unified_import_tracking')
    .select('*')
    .eq('validation_status', false);

  if (fetchError) throw fetchError;
  return stuckPayments || [];
};

export const findUnprocessedPayments = async () => {
  const { data: unprocessedPayments, error: fetchError } = await supabase
    .from('unified_import_tracking')
    .select('*')
    .eq('validation_status', false);

  if (fetchError) throw fetchError;
  return unprocessedPayments || [];
};