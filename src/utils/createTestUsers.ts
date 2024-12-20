import { supabase } from "@/integrations/supabase/client";

export const createTestUsers = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-test-users');
    
    if (error) {
      console.error('Error creating test users:', error);
      throw error;
    }

    console.log('Test users created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create test users:', error);
    throw error;
  }
};