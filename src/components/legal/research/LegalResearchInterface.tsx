import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResult {
  title: string;
  relevance: number;
  summary: string;
  url: string;
  language: string;
}

interface SearchResponse {
  timestamp: string;
  query: string;
  results: SearchResult[];
}

export const LegalResearchInterface = ({ caseId }: { caseId?: string }) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke<SearchResponse>("legal-research", {
        body: {
          query: query.trim(),
          caseId
        }
      });

      if (error) throw error;

      if (data?.results) {
        setResults(data.results);
        toast.success("Search completed successfully");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to perform legal research");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Research</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter your legal research query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{result.title}</h3>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Relevance: {(result.relevance * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded uppercase">
                      {result.language}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};