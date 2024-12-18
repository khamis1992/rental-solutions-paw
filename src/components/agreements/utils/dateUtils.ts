import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Remove any potential whitespace
    dateStr = dateStr.trim();
    
    // Try to parse DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [_, day, month, year] = ddmmyyyy;
      // Ensure day and month are padded with leading zeros
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
    
    // Try to parse MM/DD/YYYY format
    const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [_, month, day, year] = mmddyyyy;
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }
  
  return null;
};

export const fixAgreementDates = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('fix-agreement-dates');
    
    if (error) throw error;
    
    toast.success(data.message);
    return data;
  } catch (error) {
    console.error('Error fixing agreement dates:', error);
    toast.error('Failed to fix agreement dates');
    throw error;
  }
};