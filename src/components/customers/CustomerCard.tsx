
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle, Phone, MapPin, FileCheck, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
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
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error("Failed to delete customer");
    }
  };

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-200",
        "hover:shadow-md active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{customer.full_name}</h3>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {customer.phone_number && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {customer.phone_number}
            </div>
          )}
          
          {customer.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {customer.address}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {customer.id_document_url ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <FileCheck className="h-3 w-3 mr-1" />
              ID
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              ID Missing
            </Badge>
          )}

          {customer.license_document_url ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <FileCheck className="h-3 w-3 mr-1" />
              License
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              License Missing
            </Badge>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
