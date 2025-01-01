import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Copy, Check, Code, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RecommendationsListProps {
  data: any[];
}

export const RecommendationsList = ({ data }: RecommendationsListProps) => {
  const recommendations = data?.[0]?.data_points?.recommendations || [];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [implementedIds, setImplementedIds] = useState<string[]>([]);

  const handleImplement = async (recommendationId: string) => {
    try {
      // Update analytics_insights table to mark the recommendation as implemented
      const { data, error } = await supabase
        .from('analytics_insights')
        .update({
          action_taken: true,
          status: 'implemented'
        })
        .eq('id', data?.[0]?.id);

      if (error) throw error;

      // Update local state to reflect the change
      setImplementedIds(prev => [...prev, recommendationId]);
      toast.success("Recommendation marked as implemented");
    } catch (error) {
      console.error('Failed to implement recommendation:', error);
      toast.error("Failed to mark recommendation as implemented");
    }
  };

  const generatePrompt = (rec: any) => {
    return `Please help improve my code based on this recommendation:
Problem: ${rec.title}
Category: ${rec.category || 'General'}
Description: ${rec.description}
Priority: ${rec.priority}
${rec.example ? `Example of the issue:\n${rec.example}` : ''}
Please provide the necessary code changes to implement this improvement.`;
  };

  const copyPrompt = (rec: any) => {
    const prompt = generatePrompt(rec);
    navigator.clipboard.writeText(prompt);
    setCopiedId(rec.id);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: string | undefined) => {
    if (!category) return <Code className="h-4 w-4" />;
    
    switch (category.toLowerCase()) {
      case 'quality':
        return <Code className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const filteredRecommendations = selectedCategory === "all" 
    ? recommendations 
    : recommendations.filter(rec => rec.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Improvement Recommendations</CardTitle>
        <div className="flex gap-2 mt-2">
          <Button 
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          <Button 
            variant={selectedCategory === "quality" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("quality")}
          >
            <Code className="h-4 w-4 mr-2" />
            Code Quality
          </Button>
          <Button 
            variant={selectedCategory === "security" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("security")}
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </Button>
          <Button 
            variant={selectedCategory === "performance" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("performance")}
          >
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {filteredRecommendations.map((rec: any, index: number) => (
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
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getCategoryIcon(rec.category)}
                      {rec.category || "General"}
                    </Badge>
                    {implementedIds.includes(rec.id) ? (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => copyPrompt(rec)}
                    >
                      {copiedId === rec.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedId === rec.id ? "Copied!" : "Copy Prompt"}
                    </Button>
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