import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Recommendation {
  id: string;
  category: string;
  insight: string;
  recommendation: string;
  title?: string;
  priority?: string;
  description?: string;
  example?: string;
}

export interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export const RecommendationsList = ({ recommendations = [] }: RecommendationsListProps) => {
  const [implementedIds, setImplementedIds] = useState<string[]>([]);

  const handleImplement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({ 
          status: 'implemented',
          implemented_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setImplementedIds(prev => [...prev, id]);
      toast.success("Recommendation marked as implemented");
    } catch (error) {
      console.error('Failed to mark recommendation as implemented:', error);
      toast.error("Failed to mark recommendation as implemented");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{recommendation.title || recommendation.category}</h4>
                {!implementedIds.includes(recommendation.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImplement(recommendation.id)}
                  >
                    Mark Implemented
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {recommendation.description || recommendation.insight}
              </p>
              <p className="text-sm font-medium">Recommendation:</p>
              <p className="text-sm text-muted-foreground">
                {recommendation.recommendation}
              </p>
              {recommendation.example && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Example:</p>
                  <p className="text-sm text-muted-foreground">{recommendation.example}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};