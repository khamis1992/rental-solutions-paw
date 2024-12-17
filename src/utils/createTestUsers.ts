import { supabase } from "@/integrations/supabase/client";

export const createTestUsers = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-test-users', {
      method: 'POST',
    });

    if (error) {
      console.error('Error creating test users:', error);
      throw error;
    }

    console.log('Test users creation response:', data);
    return data;
  } catch (error) {
    console.error('Error invoking create-test-users function:', error);
    throw error;
  }
};