import { supabase } from "@/integrations/supabase/client";
import { validateAndFixUUID, UUIDValidationResult } from "@/utils/uuidUtils";
import { toast } from "sonner";

interface TransactionData {
  category_id: string;
  amount: number;
  description: string;
  [key: string]: any;
}

interface ValidationError {
  row: number;
  originalData: any;
  error: string;
}

interface ImportResult {
  success: boolean;
  processedCount: number;
  errors: ValidationError[];
  replacedUUIDs: { original: string; new: string }[];
}

export const processTransactionImport = async (
  transactions: TransactionData[]
): Promise<ImportResult> => {
  const errors: ValidationError[] = [];
  const replacedUUIDs: { original: string; new: string }[] = [];
  const validTransactions: TransactionData[] = [];

  // Process each transaction
  transactions.forEach((transaction, index) => {
    try {
      // Validate category_id UUID
      const uuidValidation: UUIDValidationResult = validateAndFixUUID(
        transaction.category_id
      );

      if (!uuidValidation.isValid) {
        if (uuidValidation.uuid) {
          // UUID was invalid but we generated a new one
          replacedUUIDs.push({
            original: transaction.category_id,
            new: uuidValidation.uuid
          });
          transaction.category_id = uuidValidation.uuid;
        } else {
          // UUID was invalid and couldn't be fixed
          errors.push({
            row: index + 1,
            originalData: transaction,
            error: uuidValidation.errorMessage || 'Invalid UUID format'
          });
          return;
        }
      }

      validTransactions.push(transaction);
    } catch (error) {
      errors.push({
        row: index + 1,
        originalData: transaction,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // If we have any replaced UUIDs, notify the user
  if (replacedUUIDs.length > 0) {
    console.log('Replaced UUIDs:', replacedUUIDs);
    toast.info(`${replacedUUIDs.length} invalid UUIDs were automatically fixed`);
  }

  // If we have any errors, log them
  if (errors.length > 0) {
    console.error('Transaction import errors:', errors);
    errors.forEach(error => {
      toast.error(`Row ${error.row}: ${error.error}`);
    });
  }

  // Insert valid transactions
  if (validTransactions.length > 0) {
    const { error: insertError } = await supabase
      .from('accounting_transactions')
      .insert(validTransactions);

    if (insertError) {
      console.error('Error inserting transactions:', insertError);
      throw new Error(`Failed to insert transactions: ${insertError.message}`);
    }
  }

  return {
    success: errors.length === 0,
    processedCount: validTransactions.length,
    errors,
    replacedUUIDs
  };
};