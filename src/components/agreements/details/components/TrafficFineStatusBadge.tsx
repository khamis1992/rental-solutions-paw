import { Badge } from "@/components/ui/badge";

interface TrafficFineStatusBadgeProps {
  status: string;
}

export const TrafficFineStatusBadge = ({ status }: TrafficFineStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <Badge 
      variant="secondary"
      className={getStatusColor(status)}
    >
      {status}
    </Badge>
  );
};