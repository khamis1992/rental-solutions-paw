import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateAverageRentByModel, calculateProfitMargins, generatePricingSuggestions } from "./utils/pricingAnalysis";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingDown, TrendingUp } from "lucide-react";

export const PricingAnalysis = () => {
  const { data: averageRents } = useQuery({
    queryKey: ["average-rents"],
    queryFn: calculateAverageRentByModel
  });

  const { data: margins } = useQuery({
    queryKey: ["profit-margins"],
    queryFn: calculateProfitMargins
  });

  const { data: suggestions } = useQuery({
    queryKey: ["pricing-suggestions"],
    queryFn: generatePricingSuggestions
  });

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
                <TableHead>Current Price</TableHead>
                <TableHead>Suggested Price</TableHead>
                <TableHead>Profit Margin</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions?.map((suggestion) => (
                <TableRow key={suggestion.vehicleId}>
                  <TableCell>{suggestion.vehicleId}</TableCell>
                  <TableCell>{formatCurrency(suggestion.currentPrice)}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {formatCurrency(suggestion.suggestedPrice)}
                    {suggestion.suggestedPrice > suggestion.currentPrice ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>{suggestion.profitMargin.toFixed(1)}%</TableCell>
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
                <TableHead>Average Rent</TableHead>
                <TableHead>Number of Rentals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {averageRents?.map((rent) => (
                <TableRow key={rent.model}>
                  <TableCell>{rent.model}</TableCell>
                  <TableCell>{formatCurrency(rent.averageRent)}</TableCell>
                  <TableCell>{rent.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};