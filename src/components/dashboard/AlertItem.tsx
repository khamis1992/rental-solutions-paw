import { MapPin } from "lucide-react";
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
}

export function AlertItem({ alert, onClick }: AlertItemProps) {
  const getAlertStyle = (type: AlertDetails['type']) => {
    switch (type) {
      case 'vehicle':
        return {
          containerClass: 'hover:bg-gray-50',
          iconClass: 'text-emerald-500',
          textClass: 'text-gray-700',
          descriptionClass: 'text-gray-500',
          label: 'Driving'
        };
      case 'payment':
        return {
          containerClass: 'hover:bg-gray-50',
          iconClass: 'text-amber-500',
          textClass: 'text-gray-700',
          descriptionClass: 'text-gray-500',
          label: 'Parked'
        };
      case 'maintenance':
        return {
          containerClass: 'hover:bg-gray-50',
          iconClass: 'text-orange-400',
          textClass: 'text-gray-700',
          descriptionClass: 'text-gray-500',
          label: 'Idling'
        };
      default:
        return {
          containerClass: 'hover:bg-gray-50',
          iconClass: 'text-red-500',
          textClass: 'text-gray-700',
          descriptionClass: 'text-gray-500',
          label: 'Broken'
        };
    }
  };

  const style = getAlertStyle(alert.type);

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 border-b last:border-b-0 ${style.containerClass} transition-colors cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div className={`${style.iconClass}`}>
          <MapPin className="h-5 w-5" />
        </div>
        <span className={`text-sm font-medium ${style.textClass}`}>
          {style.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">33</span>
        <span className="text-gray-400">→</span>
      </div>
    </div>
  );
}