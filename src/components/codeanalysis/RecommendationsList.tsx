import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecommendationsListProps {
  data: any[];
}

export const RecommendationsList = ({ data }: RecommendationsListProps) => {
  const recommendations = data?.[0]?.data_points?.recommendations || [];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Improvement Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {recommendations.map((rec: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{rec.title}</h3>
                  <Badge variant={rec.priority === "high" ? "destructive" : "default"}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{rec.description}</p>
                {rec.example && (
                  <pre className="mt-2 p-2 bg-muted rounded-md text-sm">
                    <code>{rec.example}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};