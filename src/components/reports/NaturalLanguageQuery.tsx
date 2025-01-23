import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

export const NaturalLanguageQuery = () => {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["natural-language-query", query],
    queryFn: async () => {
      if (!query) return null;
      
      setIsAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-report-query', {
          body: { query }
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error analyzing query:", error);
        toast.error("Failed to analyze query");
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    enabled: !!query
  });

  const renderChart = () => {
    if (!queryResult?.data) return null;

    switch (queryResult.type) {
      case 'revenue_analysis':
        return (
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queryResult.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="payment_date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" stroke="#4ade80" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'maintenance_analysis':
        return (
          <div className="mt-4 space-y-4">
            {queryResult.data.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">
                  {item.vehicles?.make} {item.vehicles?.model} ({item.vehicles?.license_plate})
                </h4>
                <p className="text-sm text-muted-foreground">
                  Predicted maintenance: {new Date(item.predicted_date).toLocaleDateString()}
                </p>
                <p className="text-sm">Estimated cost: {formatCurrency(item.estimated_cost)}</p>
              </div>
            ))}
          </div>
        );

      case 'utilization_analysis':
        return (
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queryResult.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="utilization_rate" stroke="#60a5fa" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'expense_analysis':
        return (
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queryResult.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="transaction_date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" stroke="#f43f5e" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'performance_analysis':
        return (
          <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
            {queryResult.data.map((metric: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">{metric.metric_name}</h4>
                <p className="text-sm text-muted-foreground">Category: {metric.category}</p>
                <p className="text-sm">
                  Actual: {metric.actual_value} | Benchmark: {metric.benchmark_value}
                </p>
                <p className="text-sm">Industry Average: {metric.industry_average}</p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ask Questions About Your Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Try 'Show revenue trends for last 6 months' or 'What is our fleet utilization rate?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit" disabled={isLoading || isAnalyzing}>
              {isLoading || isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Ask"
              )}
            </Button>
          </div>
        </form>

        {queryResult && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Results</h3>
            <p className="text-sm text-muted-foreground mb-4">{queryResult.summary}</p>
            {renderChart()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};