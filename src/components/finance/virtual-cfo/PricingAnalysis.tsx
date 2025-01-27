import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, Calculator, Shield } from "lucide-react";
import { calculateAverageRentByModel, calculateProfitMargins, generatePricingSuggestions } from "./utils/pricingAnalysis";
import { RiskAssessmentTab } from "./RiskAssessmentTab";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const PricingAnalysis = () => {
  const { data: averageRents, isLoading: isLoadingRents } = useQuery({
    queryKey: ["average-rents"],
    queryFn: calculateAverageRentByModel
  });

  const { data: margins, isLoading: isLoadingMargins } = useQuery({
    queryKey: ["profit-margins"],
    queryFn: calculateProfitMargins
  });

  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["pricing-suggestions"],
    queryFn: generatePricingSuggestions
  });

  const { data: riskMetrics, isLoading: isLoadingRisk } = useQuery({
    queryKey: ["risk-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_adjusted_pricing_view')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  if (isLoadingRents || isLoadingMargins || isLoadingSuggestions || isLoadingRisk) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Combine pricing suggestions with risk metrics
  const enhancedSuggestions = suggestions?.map(suggestion => {
    const riskMetric = riskMetrics?.find(rm => 
      rm.model === suggestion.model && rm.make === suggestion.make
    );
    
    return {
      ...suggestion,
      riskAdjustedPrice: riskMetric?.risk_adjusted_price || suggestion.suggestedPrice,
      defaultRate: riskMetric?.default_rate || 0,
      paymentReliability: riskMetric?.payment_reliability_score || 100
    };
  });

  const lowMarginVehicles = margins?.filter(m => m.profitMargin < 20) || [];
  const highRiskVehicles = riskMetrics?.filter(m => (m.default_rate || 0) > 15) || [];

  return (
    <Tabs defaultValue="recommendations" className="space-y-6">
      <TabsList>
        <TabsTrigger value="recommendations" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Recommendations
        </TabsTrigger>
        <TabsTrigger value="risk-assessment" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Risk Assessment
        </TabsTrigger>
      </TabsList>

      <TabsContent value="recommendations" className="space-y-6">
        {lowMarginVehicles.length > 0 && (
          <Alert variant="destructive">
            <TrendingDown className="h-4 w-4" />
            <AlertTitle>Low Profit Margin Alert</AlertTitle>
            <AlertDescription>
              {lowMarginVehicles.length} vehicles have profit margins below 20%
            </AlertDescription>
          </Alert>
        )}

        {highRiskVehicles.length > 0 && (
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>High Risk Alert</AlertTitle>
            <AlertDescription>
              {highRiskVehicles.length} vehicles have default rates above 15%
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Pricing Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Current Price (QAR)</TableHead>
                  <TableHead>Suggested Price (QAR)</TableHead>
                  <TableHead>Risk-Adjusted Price (QAR)</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Analysis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enhancedSuggestions?.map((suggestion) => (
                  <TableRow key={suggestion.vehicleId}>
                    <TableCell className="font-medium">{suggestion.licensePlate}</TableCell>
                    <TableCell>{formatCurrency(suggestion.currentPrice)}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {formatCurrency(suggestion.suggestedPrice)}
                      {suggestion.suggestedPrice > suggestion.currentPrice ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(suggestion.riskAdjustedPrice)}
                    </TableCell>
                    <TableCell>
                      <span className={
                        suggestion.defaultRate > 15 ? 'text-red-500' :
                        suggestion.defaultRate > 10 ? 'text-yellow-500' : 
                        'text-green-500'
                      }>
                        {suggestion.defaultRate > 15 ? 'High' :
                         suggestion.defaultRate > 10 ? 'Medium' : 
                         'Low'}
                      </span>
                    </TableCell>
                    <TableCell>{suggestion.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Rent by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Average Rent (QAR)</TableHead>
                  <TableHead>Number of Rentals</TableHead>
                  <TableHead>Available Cars</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {averageRents?.map((rent) => (
                  <TableRow key={rent.model}>
                    <TableCell>{rent.model}</TableCell>
                    <TableCell>{formatCurrency(rent.averageRent)}</TableCell>
                    <TableCell>{rent.count}</TableCell>
                    <TableCell>{rent.availableCars}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="risk-assessment">
        <RiskAssessmentTab />
      </TabsContent>
    </Tabs>
  );
};