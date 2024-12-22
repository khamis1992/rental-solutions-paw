import { supabase } from "@/integrations/supabase/client";

export const getDatabaseResponse = async (query: string): Promise<string | null> => {
  const lowercaseQuery = query.toLowerCase();
  
  // Vehicle-related queries
  if (lowercaseQuery.includes('how many vehicles') || lowercaseQuery.includes('vehicle count')) {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('status', { count: 'exact' });
      
    if (error) throw error;
    
    const counts = {
      total: vehicles?.length || 0,
      available: vehicles?.filter(v => v.status === 'available').length || 0,
      rented: vehicles?.filter(v => v.status === 'rented').length || 0,
      maintenance: vehicles?.filter(v => v.status === 'maintenance').length || 0
    };
    
    return `Currently, we have ${counts.total} vehicles in our fleet:
    - ${counts.available} available for rent
    - ${counts.rented} currently rented
    - ${counts.maintenance} under maintenance`;
  }
  
  // Customer-related queries
  if (lowercaseQuery.includes('how many customers') || lowercaseQuery.includes('customer count')) {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'customer');
      
    if (error) throw error;
    
    return `We currently have ${count} registered customers in our system.`;
  }
  
  // Agreement-related queries
  if (lowercaseQuery.includes('active rentals') || lowercaseQuery.includes('active agreements')) {
    const { data, error } = await supabase
      .from('leases')
      .select('*', { count: 'exact' })
      .eq('status', 'active');
      
    if (error) throw error;
    
    return `There are currently ${data?.length || 0} active rental agreements.`;
  }

  // If no matching query pattern is found, return null to fallback to AI
  return null;
};