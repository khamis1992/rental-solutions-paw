import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ExternalLink, Loader2 } from "lucide-react";

interface ResearchResult {
  title: string;
  url: string;
  summary: string;
  relevance: number;
}

interface ResearchQuery {
  id: string;
  query_text: string;
  results: {
    results: ResearchResult[];
  };
  created_at: string;
}

export const ResearchHistory = ({ caseId }: { caseId?: string }) => {
  const { data: queries, isLoading } = useQuery({
    queryKey: ["legal-research-history", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_research_queries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match the expected type
      return (data as any[]).map(query => ({
        ...query,
        results: typeof query.results === 'string' 
          ? JSON.parse(query.results)
          : query.results
      })) as ResearchQuery[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Research History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {queries?.map((query) => (
            <div key={query.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{query.query_text}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(query.created_at), "PPp")}
                  </p>
                </div>
              </div>
              {query.results?.results && (
                <div className="mt-2 space-y-2">
                  {query.results.results.map((result, index) => (
                    <div key={index} className="text-sm pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.title}</span>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center ml-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-muted-foreground">{result.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!queries?.length && (
            <p className="text-center text-muted-foreground">No research history found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};