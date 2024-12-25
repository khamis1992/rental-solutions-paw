interface TrafficFineStatusBadgeProps {
  status: string;
}

export const TrafficFineStatusBadge = ({ status }: TrafficFineStatusBadgeProps) => {
  const getStatusColor = (status: string): string => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};