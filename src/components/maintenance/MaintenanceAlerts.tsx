import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnomalyRecord } from "@/types/agreement.types";

export const MaintenanceAlerts = () => {
  const { data: anomalies, isLoading } = useQuery({
    queryKey: ["maintenance-anomalies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operational_anomalies")
        .select("*")
        .order("detected_at", { ascending: false });

      if (error) throw error;

      // Transform and validate the data
      return data.map(anomaly => {
        const affectedRecords = typeof anomaly.affected_records === 'object' 
          ? anomaly.affected_records 
          : { vehicle_id: '', license_plate: '', mileage: 0 };

        return {
          ...anomaly,
          affected_records: affectedRecords
        } as AnomalyRecord;
      });
    }
  });

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {anomalies?.map((anomaly) => (
            <div
              key={anomaly.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h4 className="font-semibold">{anomaly.detection_type}</h4>
                <p className="text-sm text-muted-foreground">
                  {anomaly.description}
                </p>
              </div>
              <Badge
                variant={
                  anomaly.severity === "high"
                    ? "destructive"
                    : anomaly.severity === "medium"
                    ? "warning"
                    : "default"
                }
              >
                {anomaly.severity}
              </Badge>
            </div>
          ))}
          {(!anomalies || anomalies.length === 0) && (
            <p className="text-center text-muted-foreground">
              No maintenance alerts found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};