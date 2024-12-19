import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Battery, Oil, Brake } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const getMaintenancePredictions = async () => {
  const { data, error } = await supabase
    .from('maintenance_predictions')
    .select(`
      *,
      vehicles (
        make,
        model,
        year,
        license_plate
      )
    `)
    .order('predicted_date', { ascending: true });

  if (error) throw error;
  return data;
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const predictionIcons = {
  oil_change: Oil,
  brake_service: Brake,
  battery_replacement: Battery,
};

export const PredictiveMaintenance = () => {
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['maintenance-predictions'],
    queryFn: getMaintenancePredictions,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highPriorityPredictions = predictions.filter(p => p.priority === 'high');

  return (
    <div className="space-y-6">
      {highPriorityPredictions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Priority Maintenance Required</AlertTitle>
          <AlertDescription>
            {highPriorityPredictions.length} vehicles need immediate attention
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction) => {
              const Icon = predictionIcons[prediction.prediction_type as keyof typeof predictionIcons] || AlertTriangle;
              
              return (
                <div
                  key={prediction.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h4 className="font-semibold">
                        {prediction.vehicles?.make} {prediction.vehicles?.model} ({prediction.vehicles?.license_plate})
                      </h4>
                      <Badge className={priorityColors[prediction.priority as keyof typeof priorityColors]}>
                        {prediction.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {prediction.predicted_issues?.join(', ')}
                    </p>
                    <div className="text-sm">
                      <span className="font-medium">Recommended Services: </span>
                      {prediction.recommended_services?.join(', ')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Estimated Cost: </span>
                      {formatCurrency(prediction.estimated_cost || 0)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Due by: {new Date(prediction.predicted_date).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};