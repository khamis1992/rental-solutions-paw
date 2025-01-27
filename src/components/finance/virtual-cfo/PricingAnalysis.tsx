import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateAverageRentByModel, calculateProfitMargins, generatePricingSuggestions } from "./utils/pricingAnalysis";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingDown, TrendingUp, Loader2 } from "lucide-react";

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

  if (isLoadingRents || isLoadingMargins || isLoadingSuggestions) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const lowMarginVehicles = margins?.filter(m => m.profitMargin < 20) || [];
  const underPricedVehicles = suggestions?.filter(s => s.currentPrice < s.suggestedPrice * 0.85) || [];

  return (
    <div className="space-y-6">
      {lowMarginVehicles.length > 0 && (
        <Alert variant="destructive">
          <TrendingDown className="h-4 w-4" />
          <AlertTitle>Low Profit Margin Alert</AlertTitle>
          <AlertDescription>
            {lowMarginVehicles.length} vehicles have profit margins below 20%
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
                <TableHead>Profit Margin</TableHead>
                <TableHead>Analysis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions?.map((suggestion) => (
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
                    <span className={suggestion.profitMargin < 20 ? 'text-red-500' : 'text-green-500'}>
                      {suggestion.profitMargin.toFixed(1)}%
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
    </div>
  );
};