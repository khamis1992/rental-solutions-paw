import { supabase } from "@/integrations/supabase/client";

type TableNames =
  | "profiles"
  | "leases"
  | "vehicles"
  | "maintenance"
  | "payments"
  | "penalties"
  | "damages"
  | "vehicle_documents"
  | "vehicle_inspections"
  | "vehicle_insurance"
  | "vehicle_parts"
  | "expense_categories"
  | "expense_transactions"
  | "accounting_categories"
  | "accounting_transactions"
  | "accounting_invoices"
  | "legal_cases"
  | "legal_documents"
  | "legal_document_templates"
  | "legal_notification_templates"
  | "compliance_documents"
  | "compliance_alerts"
  | "audit_records"
  | "tax_filings";

export async function testTableAccess(table: TableNames) {
  try {
    const { data, error } = await supabase.from(table).select().limit(1);
    return {
      success: !error,
      error: error?.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function testInsertAccess(table: TableNames, testData: any) {
  try {
    const { data, error } = await supabase.from(table).insert([testData]);
    return {
      success: !error,
      error: error?.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function testUpdateAccess(
  table: TableNames,
  id: string,
  updates: any
) {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("id", id);
    return {
      success: !error,
      error: error?.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function testDeleteAccess(table: TableNames, id: string) {
  try {
    const { data, error } = await supabase.from(table).delete().eq("id", id);
    return {
      success: !error,
      error: error?.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}