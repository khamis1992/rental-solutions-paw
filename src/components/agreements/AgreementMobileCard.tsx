
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Info, Trash2, Shield, Clock, Ban, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { useSwipeActions } from "@/hooks/use-swipe-actions";
import { Agreement } from "@/types/agreement.types";
import { toast } from "sonner";

interface AgreementMobileCardProps {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleted: () => void;
  onDeleteClick: () => void;
}

export const AgreementMobileCard = ({
  agreement,
  onViewContract,
  onAgreementClick,
  onNameClick,
  onDeleted,
  onDeleteClick,
}: AgreementMobileCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const { swipeOffset, handlers, resetSwipe } = useSwipeActions({
    onDelete: () => {
      onDeleteClick();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    },
    threshold: 80,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-400';
      case 'pending_payment':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-400';
      case 'terminated':
        return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Shield className="h-4 w-4 text-emerald-600" />;
      case 'pending_payment':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'terminated':
        return <Ban className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative" {...handlers}>
      <Card 
        className={cn(
          "group relative transition-all duration-200 transform",
          "hover:shadow-md active:scale-[0.98]",
          "touch-none select-none",
        )}
        style={{ 
          transform: `translateX(-${swipeOffset}px)`,
          transition: 'transform 0.2s ease-out'
        }}
        onClick={() => {
          resetSwipe();
          onNameClick(agreement.id);
        }}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-medium text-base text-primary">
                {agreement.agreement_number}
              </h3>
              <p className="text-sm text-muted-foreground">
                {agreement.vehicle?.license_plate}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize",
                getStatusColor(agreement.status),
                "flex items-center gap-1.5 px-2 py-1"
              )}
            >
              {getStatusIcon(agreement.status)}
              {agreement.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Vehicle:</span>
              <span>{`${agreement.vehicle?.make} ${agreement.vehicle?.model}`}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Customer:</span>
              <span>{agreement.customer?.full_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Period:</span>
              <span>
                {formatDateToDisplay(agreement.start_date)} - {formatDateToDisplay(agreement.end_date)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onViewContract(agreement.id);
                if (navigator.vibrate) navigator.vibrate(50);
              }}
            >
              <FileText className="h-5 w-5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onAgreementClick(agreement.id);
                if (navigator.vibrate) navigator.vibrate(50);
              }}
            >
              <Info className="h-5 w-5 text-blue-600" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete action revealed on swipe */}
      <div 
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500 rounded-r-lg"
        style={{ 
          width: '80px',
          opacity: swipeOffset > 0 ? 1 : 0,
          transition: 'opacity 0.2s ease-out'
        }}
      >
        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
          }}
          className="h-full text-white hover:text-white/90"
        >
          <Trash2 className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
