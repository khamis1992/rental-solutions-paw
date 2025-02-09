
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle, Phone, MapPin, FileCheck, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useSwipeActions } from "@/hooks/use-swipe-actions";
import type { Customer } from "./types/customer";

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  onDeleted: () => void;
}

export const CustomerCard = ({ customer, onClick, onDeleted }: CustomerCardProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;
      toast.success("Customer deleted successfully");
      onDeleted();
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error("Failed to delete customer");
    }
  };

  const { swipeOffset, handlers, resetSwipe } = useSwipeActions({
    onDelete: handleDelete,
    threshold: 80,
  });

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
          onClick();
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-base">{customer.full_name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2.5">
            {customer.phone_number && (
              <div className="flex items-center gap-2.5 text-sm min-h-[44px]">
                <Phone className="h-5 w-5 text-muted-foreground" />
                {customer.phone_number}
              </div>
            )}
          
            {customer.address && (
              <div className="flex items-center gap-2.5 text-sm min-h-[44px]">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                {customer.address}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {customer.id_document_url ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <FileCheck className="h-4 w-4 mr-1.5" />
                ID
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                <AlertCircle className="h-4 w-4 mr-1.5" />
                ID Missing
              </Badge>
            )}

            {customer.license_document_url ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <FileCheck className="h-4 w-4 mr-1.5" />
                License
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                <AlertCircle className="h-4 w-4 mr-1.5" />
                License Missing
              </Badge>
            )}
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
          onClick={handleDelete}
          className="h-full text-white hover:text-white/90"
        >
          <Trash2 className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

