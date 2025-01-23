import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

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
                placeholder="e.g. 'Show me revenue trends for the last 6 months' or 'Which vehicles need maintenance soon?'"
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
            <div className="p-4 bg-background-alt rounded-lg">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};