import { supabase } from "@/integrations/supabase/client";

export const getDatabaseResponse = async (query: string): Promise<string | null> => {
  const lowercaseQuery = query.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(query);
  
  // Vehicle-related queries
  if (lowercaseQuery.includes('how many') || 
      lowercaseQuery.includes('vehicle') || 
      lowercaseQuery.includes('car') ||
      query.includes('كم عدد') ||
      query.includes('سيارات') ||
      query.includes('مركبات')) {
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
    
    return isArabic
      ? `لدينا حالياً ${counts.total} مركبة في أسطولنا:
         - ${counts.available} متاحة للإيجار
         - ${counts.rented} مؤجرة حالياً
         - ${counts.maintenance} تحت الصيانة`
      : `Currently, we have ${counts.total} vehicles in our fleet:
         - ${counts.available} available for rent
         - ${counts.rented} currently rented
         - ${counts.maintenance} under maintenance`;
  }
  
  // Customer-related queries
  if (lowercaseQuery.includes('how many') && lowercaseQuery.includes('customer') || 
      lowercaseQuery.includes('customer count') ||
      query.includes('كم عدد العملاء') ||
      query.includes('عدد الزبائن')) {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'customer');
      
    if (error) throw error;
    
    return isArabic
      ? `لدينا حالياً ${count} عميل مسجل في نظامنا.`
      : `We currently have ${count} registered customers in our system.`;
  }
  
  // Agreement-related queries
  if ((lowercaseQuery.includes('active') && 
       (lowercaseQuery.includes('rental') || lowercaseQuery.includes('agreement'))) ||
      (query.includes('نشط') && 
       (query.includes('إيجار') || query.includes('عقد')))) {
    const { data, error } = await supabase
      .from('leases')
      .select('*', { count: 'exact' })
      .eq('status', 'active');
      
    if (error) throw error;
    
    return isArabic
      ? `يوجد حالياً ${data?.length || 0} عقد إيجار نشط.`
      : `There are currently ${data?.length || 0} active rental agreements.`;
  }

  // Payment-related queries
  if (lowercaseQuery.includes('payment') || 
      lowercaseQuery.includes('revenue') ||
      query.includes('دفع') ||
      query.includes('إيرادات')) {
    const { data: payments, error } = await supabase
      .from('unified_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (payments && payments.length > 0) {
      const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      return isArabic
        ? `نشاط الدفع الأخير: تمت معالجة ${payments.length} دفعة، بإجمالي ${totalAmount} ريال قطري.`
        : `Recent payment activity: ${payments.length} payments processed, totaling ${totalAmount} QAR.`;
    }
  }

  // If no matching query pattern is found, return a helpful message
  return isArabic
    ? "يمكنني تقديم معلومات حول مركباتنا، عملائنا، العقود، المدفوعات، والصيانة. يرجى طرح أسئلة محددة حول هذه المواضيع."
    : "I can provide information about our vehicles, customers, agreements, payments, and maintenance. Please ask specific questions about these topics.";
};