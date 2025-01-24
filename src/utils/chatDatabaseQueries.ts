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
  
  // Overdue payments query
  if (lowercaseQuery.includes('overdue') || 
      lowercaseQuery.includes('late payment') ||
      query.includes('متأخرات') ||
      query.includes('دفعات متأخرة')) {
    const { data: overduePayments, error } = await supabase
      .from('overdue_payments_view')
      .select(`
        *,
        customer:customer_id (
          full_name,
          phone_number
        )
      `)
      .eq('status', 'pending');

    if (error) throw error;

    if (!overduePayments?.length) {
      return isArabic
        ? "لا توجد مدفوعات متأخرة حالياً"
        : "There are no overdue payments at the moment";
    }

    const summary = overduePayments.map(payment => 
      isArabic
        ? `${payment.customer.full_name}: ${payment.balance} ريال قطري (${payment.days_overdue} يوم)`
        : `${payment.customer.full_name}: ${payment.balance} QAR (${payment.days_overdue} days)`
    ).join('\n');

    return isArabic
      ? `المدفوعات المتأخرة:\n${summary}`
      : `Overdue payments:\n${summary}`;
  }

  // Vehicle status update
  if ((lowercaseQuery.includes('change status') || lowercaseQuery.includes('update status')) &&
      (lowercaseQuery.includes('vehicle') || lowercaseQuery.includes('car'))) {
    const matches = query.match(/vehicle\s+([A-Za-z0-9-]+)\s+to\s+(available|maintenance)/i);
    if (!matches) return "Please specify the vehicle license plate and desired status (available/maintenance)";

    const [, licensePlate, newStatus] = matches;
    const { error } = await supabase
      .from('vehicles')
      .update({ status: newStatus.toLowerCase() })
      .eq('license_plate', licensePlate);

    if (error) throw error;
    
    return `Vehicle ${licensePlate} status updated to ${newStatus}`;
  }

  // Invoice generation request
  if (lowercaseQuery.includes('generate invoice') || 
      lowercaseQuery.includes('create invoice') ||
      query.includes('إنشاء فاتورة')) {
    const matches = query.match(/agreement\s+([A-Za-z0-9-]+)/i);
    if (!matches) {
      return isArabic
        ? "الرجاء تحديد رقم الاتفاقية"
        : "Please specify the agreement number";
    }

    const agreementNumber = matches[1];
    const { data: lease, error } = await supabase
      .from('leases')
      .select('id')
      .eq('agreement_number', agreementNumber)
      .single();

    if (error || !lease) {
      return isArabic
        ? "لم يتم العثور على الاتفاقية"
        : "Agreement not found";
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('accounting_invoices')
      .insert({
        customer_id: lease.id,
        invoice_number: `INV-${Date.now()}`,
        amount: 0, // This should be calculated based on your business logic
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        issued_date: new Date().toISOString()
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    return isArabic
      ? `تم إنشاء الفاتورة رقم ${invoice.invoice_number}`
      : `Invoice ${invoice.invoice_number} has been generated`;
  }

  // If no matching query pattern is found, return a helpful message
  return isArabic
    ? "يمكنني تقديم معلومات حول مركباتنا، عملائنا، العقود، المدفوعات، والصيانة. يرجى طرح أسئلة محددة حول هذه المواضيع."
    : "I can provide information about our vehicles, customers, agreements, payments, and maintenance. Please ask specific questions about these topics.";
};