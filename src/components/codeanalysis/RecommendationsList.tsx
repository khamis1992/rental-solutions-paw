import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp } from "lucide-react";

interface RecommendationsListProps {
  data: any[];
}

export const RecommendationsList = ({ data }: RecommendationsListProps) => {
  const recommendations = data?.[0]?.data_points?.recommendations || [];

  const handleImplement = async (recommendationId: string) => {
    try {
      // Here you would typically update the recommendation status
      console.log('Implementing recommendation:', recommendationId);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to implement recommendation:', error);
    }
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Improvement Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {recommendations.map((rec: any, index: number) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={rec.priority === "high" ? "destructive" : "secondary"}
                    >
                      {rec.priority === "high" ? "High Priority" : "Normal Priority"}
                    </Badge>
                    {rec.implemented ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Implemented
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImplement(rec.id)}
                      >
                        Mark Implemented
                      </Button>
                    )}
                  </div>
                  <h4 className="font-semibold mt-2">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  {rec.example && (
                    <div className="mt-2 bg-muted p-2 rounded-md">
                      <p className="text-sm font-medium">Example:</p>
                      <pre className="text-sm overflow-x-auto">
                        <code>{rec.example}</code>
                      </pre>
                    </div>
                  )}
                  {rec.impact_score && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Impact Score: {rec.impact_score}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};