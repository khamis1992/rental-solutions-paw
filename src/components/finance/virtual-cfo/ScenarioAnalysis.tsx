import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const ScenarioAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenario, setScenario] = useState({
    description: "",
    investment: "",
    expectedRoi: "",
    expectedProfit: ""
  });

  // Fetch active agreements total rent amount (monthly income)
  const { data: monthlyIncome = 0 } = useQuery({
    queryKey: ["monthly-income"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('rent_amount')
        .eq('status', 'active');

      if (error) throw error;
      return data.reduce((sum, lease) => sum + (lease.rent_amount || 0), 0);
    }
  });

  // Fetch monthly fixed costs
  const { data: monthlyFixedCosts = 0 } = useQuery({
    queryKey: ["monthly-fixed-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounting_transactions')
        .select('amount')
        .eq('type', 'EXPENSE')
        .eq('cost_type', 'fixed');

      if (error) throw error;
      return data.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    }
  });

  // Fetch historical analyses
  const { data: analyses = [] } = useQuery({
    queryKey: ["scenario-analyses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_analytics_insights')
        .select('*')
        .eq('category', 'financial_scenario')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-financial-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scenario,
          monthlyIncome,
          monthlyFixedCosts
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      toast.success("Scenario analysis completed");
      // Refresh the analyses list
      refetch();
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze scenario");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Monthly Income (Active Agreements)</div>
              <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Monthly Fixed Costs</div>
              <div className="text-2xl font-bold">{formatCurrency(monthlyFixedCosts)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Net Monthly Income</div>
              <div className="text-2xl font-bold">{formatCurrency(monthlyIncome - monthlyFixedCosts)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Scenario Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your financial scenario..."
                value={scenario.description}
                onChange={(e) => setScenario(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Investment Amount (QAR)"
                  value={scenario.investment}
                  onChange={(e) => setScenario(prev => ({ ...prev, investment: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Expected ROI (%)"
                  value={scenario.expectedRoi}
                  onChange={(e) => setScenario(prev => ({ ...prev, expectedRoi: e.target.value }))}
                />
              </div>
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Scenario'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{analysis.insight}</p>
                    {analysis.data_points && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">ROI</div>
                          <div className="text-lg font-semibold">
                            {(analysis.data_points.roi_percentage || 0).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Net Profit</div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(analysis.data_points.net_profit || 0)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
