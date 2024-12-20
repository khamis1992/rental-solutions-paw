import { supabase } from "@/integrations/supabase/client";

export const createTestAgreements = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-test-agreements');
    
    if (error) {
      console.error('Error creating test agreements:', error);
      throw error;
    }

    console.log('Test agreements created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create test agreements:', error);
    throw error;
  }
};