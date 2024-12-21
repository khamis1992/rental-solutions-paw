import { AlertCircle, Car, CreditCard, WrenchIcon } from "lucide-react";
import { AlertDetails } from "./types/alert-types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AlertItemProps {
  alert: AlertDetails;
  onClick: () => void;
  count?: number;
}

export function AlertItem({ alert, onClick, count }: AlertItemProps) {
  const getAlertStyle = (type: AlertDetails['type']) => {
    switch (type) {
      case 'vehicle':
        return {
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-700',
          icon: Car,
        };
      case 'payment':
        return {
          bgClass: 'bg-red-50',
          textClass: 'text-red-700',
          icon: CreditCard,
        };
      case 'maintenance':
        return {
          bgClass: 'bg-yellow-50',
          textClass: 'text-yellow-700',
          icon: WrenchIcon,
        };
      default:
        return {
          bgClass: 'bg-gray-50',
          textClass: 'text-gray-700',
          icon: AlertCircle,
        };
    }
  };

  const style = getAlertStyle(alert.type);
  const Icon = style.icon;

  const getAlertText = (alert: AlertDetails) => {
    switch (alert.type) {
      case 'vehicle':
        return {
          title: 'Vehicle Return Due',
          description: `${alert.vehicle?.make} ${alert.vehicle?.model} (${alert.vehicle?.license_plate})`,
        };
      case 'payment':
        return {
          title: 'Payment Overdue',
          description: alert.customer?.full_name || 'Unknown Customer',
        };
      case 'maintenance':
        return {
          title: 'Maintenance Required',
          description: `${alert.vehicle?.make} ${alert.vehicle?.model} (${alert.vehicle?.license_plate})`,
        };
      default:
        return {
          title: 'Alert',
          description: 'Unknown alert type',
        };
    }
  };

  const alertText = getAlertText(alert);

  return (
    <div
      className="flex items-center space-x-4 rounded-lg border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={onClick}
    >
      <div className={`rounded-lg p-2 ${style.bgClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 text-center">
        <div className="flex items-center justify-center">
          <h4 className={`text-sm font-medium ${style.textClass} mb-0.5`}>
            {alertText.title}
            {count && count > 1 && (
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </h4>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="truncate text-sm text-muted-foreground">
                {alertText.description}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{alertText.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}