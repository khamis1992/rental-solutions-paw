import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const FinancialQueryInterface = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuerySubmit = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-financial-query', {
        body: { query }
      });

      if (error) throw error;

      // Store query and response in history
      await supabase.from('ai_query_history').insert({
        query,
        detected_language: 'english',
        detected_intent: data.intent,
        response_data: data.response,
        success_rate: data.confidence
      });

      toast.success("Analysis complete");
      setQuery("");
    } catch (error) {
      console.error("Error processing query:", error);
      toast.error("Failed to process query");
    } finally {
      setIsProcessing(false);
    }
  };

  const { data: recentQueries } = useQuery({
    queryKey: ["recent-financial-queries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_query_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Financial Query Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Ask any question about your financial data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleQuerySubmit} 
            disabled={!query.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Ask Question"
            )}
          </Button>
        </div>

        {recentQueries?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Recent Queries</h4>
            <div className="space-y-2">
              {recentQueries.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 rounded-lg bg-muted/50"
                >
                  <p className="font-medium">{item.query}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {JSON.stringify(item.response_data)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};