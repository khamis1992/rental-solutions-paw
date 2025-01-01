import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RecommendationsListProps {
  recommendations: any[];
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
                <h4 className="font-medium">{recommendation.category}</h4>
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
              <p className="text-sm text-muted-foreground mb-2">{recommendation.insight}</p>
              <p className="text-sm font-medium">Recommendation:</p>
              <p className="text-sm text-muted-foreground">{recommendation.recommendation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};