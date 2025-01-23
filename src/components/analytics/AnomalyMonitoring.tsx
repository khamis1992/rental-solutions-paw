import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, Clock } from "lucide-react";
import { toast } from "sonner";

interface AffectedRecords {
  vehicle_id: string;
  license_plate: string;
  mileage: number;
}

interface Anomaly {
  id: string;
  detection_type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affected_records: AffectedRecords;
  detected_at: string;
  resolved_at: string | null;
}

export const AnomalyMonitoring = () => {
  const [realtimeAnomalies, setRealtimeAnomalies] = useState<Anomaly[]>([]);

  const { data: initialAnomalies } = useQuery({
    queryKey: ["operational-anomalies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operational_anomalies")
        .select("*")
        .is("resolved_at", null)
        .order("detected_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Transform the data to ensure it matches the Anomaly type
      return (data as any[]).map(item => ({
        ...item,
        affected_records: typeof item.affected_records === 'string' 
          ? JSON.parse(item.affected_records)
          : item.affected_records
      })) as Anomaly[];
    },
  });

  useEffect(() => {
    if (initialAnomalies) {
      setRealtimeAnomalies(initialAnomalies);
    }
  }, [initialAnomalies]);

  useEffect(() => {
    const channel = supabase
      .channel('anomalies-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operational_anomalies'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAnomaly = payload.new as Anomaly;
            setRealtimeAnomalies(prev => [newAnomaly, ...prev].slice(0, 5));
            
            // Enhanced toast notifications based on severity
            const toastConfig = {
              duration: newAnomaly.severity === 'high' ? 10000 : 5000,
              action: {
                label: "View Details",
                onClick: () => console.log("Viewing details for:", newAnomaly.id)
              }
            };

            switch (newAnomaly.severity) {
              case 'high':
                toast.error(`Critical Alert: ${newAnomaly.description}`, toastConfig);
                break;
              case 'medium':
                toast.warning(`Warning: ${newAnomaly.description}`, toastConfig);
                break;
              case 'low':
                toast.info(`Notice: ${newAnomaly.description}`, toastConfig);
                break;
            }
          } else if (payload.eventType === 'UPDATE') {
            setRealtimeAnomalies(prev => 
              prev.map(anomaly => 
                anomaly.id === payload.new.id ? payload.new as Anomaly : anomaly
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'low':
        return <Bell className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Real-time Anomaly Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {realtimeAnomalies?.map((anomaly) => (
            <div
              key={anomaly.id}
              className="flex items-start justify-between p-4 border rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={getSeverityColor(anomaly.severity)}
                  >
                    {anomaly.detection_type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(anomaly.detected_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{anomaly.description}</p>
                {anomaly.affected_records && (
                  <p className="text-xs text-muted-foreground">
                    Vehicle: {anomaly.affected_records.license_plate} | 
                    Mileage: {anomaly.affected_records.mileage.toLocaleString()} km
                  </p>
                )}
              </div>
              {getSeverityIcon(anomaly.severity)}
            </div>
          ))}
          {(!realtimeAnomalies || realtimeAnomalies.length === 0) && (
            <div className="text-center text-muted-foreground p-4">
              No active anomalies detected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};