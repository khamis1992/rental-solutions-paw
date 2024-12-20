export const normalizeStatus = (status: string): string => {
  if (!status) return 'pending';
  
  const statusMap: Record<string, string> = {
    'open': 'open',
    'active': 'active',
    'closed': 'closed',
    'cancelled': 'cancelled',
    'pending': 'pending',
    'pending_payment': 'pending'
  };

  const normalizedStatus = status.toLowerCase().trim();
  return statusMap[normalizedStatus] || 'pending';
};