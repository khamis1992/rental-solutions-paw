import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface Recommendation {
  id: string;
  title: string;
  priority: string;
  description: string;
  category: string;
  insight: string;
  recommendation: string;
  example?: string;
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export const RecommendationsList = ({ recommendations }: RecommendationsListProps) => {
  const [implementedItems, setImplementedItems] = useState<string[]>([]);

  const handleMarkImplemented = (id: string) => {
    setImplementedItems([...implementedItems, id]);
  };

  return (
    <div className="space-y-4">
      {recommendations.map((item) => (
        <Card key={item.id} className={implementedItems.includes(item.id) ? "opacity-50" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              {item.title}
              <span className={`text-sm px-2 py-1 rounded ${
                item.priority === 'high' ? 'bg-red-100 text-red-800' :
                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {item.priority}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Description:</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Category:</h4>
              <p className="text-sm text-gray-600">{item.category}</p>
            </div>
            {item.example && (
              <div>
                <h4 className="font-semibold mb-1">Example:</h4>
                <pre className="text-sm bg-gray-50 p-2 rounded">{item.example}</pre>
              </div>
            )}
            {!implementedItems.includes(item.id) && (
              <Button 
                onClick={() => handleMarkImplemented(item.id)}
                variant="outline"
                size="sm"
              >
                Mark as Implemented
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};