import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

interface DocumentExpiryNotificationsProps {
  vehicleId: string;
}

export const DocumentExpiryNotifications = ({ vehicleId }: DocumentExpiryNotificationsProps) => {
  const { data: expiringDocuments, isLoading } = useQuery({
    queryKey: ['vehicle-expiring-documents', vehicleId],
    queryFn: async () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data, error } = await supabase
        .from('vehicle_documents')
        .select(`
          id,
          document_type,
          expiry_date,
          category,
          notification_sent,
          notification_date
        `)
        .eq('vehicle_id', vehicleId)
        .lte('expiry_date', thirtyDaysFromNow.toISOString())
        .gte('expiry_date', new Date().toISOString())
        .order('expiry_date', { ascending: true });

      if (error) {
        toast.error("Failed to fetch expiring documents");
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!expiringDocuments?.length) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-500" />
          Document Expiry Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiringDocuments.map((doc) => {
            const daysUntilExpiry = Math.ceil(
              (new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <FileWarning className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium capitalize">
                      {doc.document_type.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Expires on {format(new Date(doc.expiry_date), 'dd/MM/yyyy')}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={daysUntilExpiry <= 7 ? "destructive" : "warning"}
                  className="ml-auto"
                >
                  {daysUntilExpiry} days left
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};