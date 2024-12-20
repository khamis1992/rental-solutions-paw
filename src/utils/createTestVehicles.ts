import { supabase } from "@/integrations/supabase/client";

export const createTestVehicles = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-test-vehicles');
    
    if (error) {
      console.error('Error creating test vehicles:', error);
      throw error;
    }

    console.log('Test vehicles created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create test vehicles:', error);
    throw error;
  }
};