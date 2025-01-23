import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MaintenanceAlerts() {
  const { data: anomalies, isLoading } = useQuery({
    queryKey: ['maintenance-anomalies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operational_anomalies')
        .select(`
          *,
          affected_records
        `)
        .eq('detection_type', 'maintenance_required')
        .order('detected_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('maintenance-anomalies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'operational_anomalies',
          filter: 'detection_type=eq.maintenance_required'
        },
        (payload) => {
          toast.warning("New maintenance alert detected!", {
            description: payload.new.description
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Maintenance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : anomalies && anomalies.length > 0 ? (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(anomaly.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${getSeverityColor(anomaly.severity)} text-white`}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(anomaly.detected_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{anomaly.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Vehicle: {anomaly.affected_records.license_plate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mileage: {anomaly.affected_records.mileage.toLocaleString()} km
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-4" />
              <p>No maintenance alerts at this time</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}