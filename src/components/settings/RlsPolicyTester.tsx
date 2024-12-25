import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { testRlsPolicies } from "@/utils/testRlsPolicies";
import { Loader2 } from "lucide-react";

interface TestResult {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  success: boolean;
  error?: string;
}

export const RlsPolicyTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const testResults = await testRlsPolicies();
      setResults(testResults);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          RLS Policy Tester
          <Button 
            onClick={handleTest} 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test RLS Policies
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={`${result.table}-${result.operation}-${index}`}
                className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{result.table}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {result.operation.toUpperCase()}
                    </span>
                  </div>
                  <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                {!result.success && result.error && (
                  <p className="mt-2 text-sm text-red-600">{result.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {results.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground">
            Click the button above to test RLS policies
          </div>
        )}
      </CardContent>
    </Card>
  );
};