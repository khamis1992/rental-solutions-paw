import { Bell, Calendar, CarFront } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertDetails } from "./types/alert-types";

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
          containerClass: 'border-red-200 bg-red-50 hover:bg-red-100',
          iconClass: 'bg-red-100 text-red-500',
          textClass: 'text-red-700',
          descriptionClass: 'text-red-600',
          Icon: CarFront
        };
      case 'payment':
        return {
          containerClass: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
          iconClass: 'bg-yellow-100 text-yellow-500',
          textClass: 'text-yellow-700',
          descriptionClass: 'text-yellow-600',
          Icon: Bell
        };
      case 'maintenance':
        return {
          containerClass: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
          iconClass: 'bg-blue-100 text-blue-500',
          textClass: 'text-blue-700',
          descriptionClass: 'text-blue-600',
          Icon: Calendar
        };
    }
  };

  const style = getAlertStyle(alert.type);
  const { Icon } = style;

  const getAlertText = () => {
    switch (alert.type) {
      case 'vehicle':
        return {
          title: 'Overdue Vehicle',
          description: `${alert.vehicle?.year} ${alert.vehicle?.make} ${alert.vehicle?.model} - ${alert.customer?.full_name}`
        };
      case 'payment':
        return {
          title: 'Overdue Payment',
          description: alert.customer?.full_name
        };
      case 'maintenance':
        return {
          title: 'Maintenance Due',
          description: `${alert.vehicle?.year} ${alert.vehicle?.make} ${alert.vehicle?.model}`
        };
    }
  };

  const alertText = getAlertText();

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border ${style.containerClass} transition-colors cursor-pointer`}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${style.iconClass} flex-shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
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
              <p className={`text-xs ${style.descriptionClass} truncate`}>
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