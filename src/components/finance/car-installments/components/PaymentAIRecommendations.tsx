import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CircleSlash, AlertTriangle, CheckCircle } from "lucide-react";

interface PaymentAIRecommendationsProps {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

export const PaymentAIRecommendations = ({
  riskLevel,
  factors,
  recommendations
}: PaymentAIRecommendationsProps) => {
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <CircleSlash className="h-4 w-4 text-red-500" />;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Alert className="mt-4">
      <AlertTitle className="flex items-center gap-2">
        {getRiskIcon()}
        <span>AI Analysis</span>
        <Badge className={getRiskColor()}>
          {riskLevel.toUpperCase()} RISK
        </Badge>
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <h4 className="font-semibold">Risk Factors:</h4>
          <ul className="list-disc pl-4 mt-1">
            {factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
        <div className="mt-2">
          <h4 className="font-semibold">Recommendations:</h4>
          <ul className="list-disc pl-4 mt-1">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};