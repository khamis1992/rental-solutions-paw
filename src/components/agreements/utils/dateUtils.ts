import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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