import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PricingSuggestion {
  vehicleId: string;
  licensePlate: string;
  currentPrice: number;
  suggestedPrice: number;
  profitMargin: number;
  reason: string;
}

interface RiskMetric {
  model: string;
  make: string;
  year: number;
  current_avg_rent: number;
  default_rate: number | null;
  payment_reliability_score: number | null;
  price_elasticity_score: number | null;
  risk_adjusted_markup: number | null;
  risk_adjusted_price: number;
}

export const PricingAnalysis = () => {
  const { data: riskMetrics, isLoading: isLoadingRisk } = useQuery({
    queryKey: ["risk-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_adjusted_pricing_view')
        .select('*');
      
      if (error) throw error;
      return data as RiskMetric[];
    }
  });

  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["pricing-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet_optimization_recommendations')
        .select(`
          id,
          vehicle_id,
          recommendation_type,
          description,
          priority,
          estimated_impact,
          confidence_score,
          vehicles (
            license_plate,
            make,
            model,
            year
          )
        `)
        .eq('recommendation_type', 'pricing')
        .order('priority', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const highRiskModels = riskMetrics?.filter(m => (m.default_rate || 0) > 15) || [];

  if (isLoadingRisk || isLoadingSuggestions) {
    return <div>Loading pricing analysis...</div>;
  }

  return (
    <div className="space-y-6">
      {highRiskModels.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>High Risk Alert</AlertTitle>
          <AlertDescription>
            {highRiskModels.length} vehicle models have default rates above 15%
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Assessment Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle Model</TableHead>
                <TableHead>Default Rate</TableHead>
                <TableHead>Payment Reliability</TableHead>
                <TableHead>Price Elasticity</TableHead>
                <TableHead>Risk-Adjusted Price (QAR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskMetrics?.map((metric) => (
                <TableRow key={`${metric.make}-${metric.model}-${metric.year}`}>
                  <TableCell className="font-medium">
                    {metric.make} {metric.model} {metric.year}
                  </TableCell>
                  <TableCell className={(metric.default_rate || 0) > 15 ? 'text-red-500' : 'text-green-500'}>
                    {(metric.default_rate || 0).toFixed(1)}%
                  </TableCell>
                  <TableCell className={(metric.payment_reliability_score || 0) < 70 ? 'text-red-500' : 'text-green-500'}>
                    {(metric.payment_reliability_score || 0).toFixed(1)}%
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {(metric.price_elasticity_score || 0).toFixed(1)}
                    {(metric.price_elasticity_score || 0) > 75 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(metric.risk_adjusted_price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions?.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell className="font-medium">
                    {suggestion.vehicles?.license_plate} - {suggestion.vehicles?.make} {suggestion.vehicles?.model}
                  </TableCell>
                  <TableCell>
                    <span className={
                      suggestion.priority === 'high' ? 'text-red-500' :
                      suggestion.priority === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }>
                      {suggestion.priority}
                    </span>
                  </TableCell>
                  <TableCell>{suggestion.estimated_impact}</TableCell>
                  <TableCell>{suggestion.confidence_score}%</TableCell>
                  <TableCell>{suggestion.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};