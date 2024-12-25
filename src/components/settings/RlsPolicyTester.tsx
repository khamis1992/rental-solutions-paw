import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const RlsPolicyTester = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    try {
      // Test profiles table access
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      setResults(prev => [...prev, {
        test: 'Profiles Read Access',
        result: profilesError ? 'Failed' : 'Passed',
        error: profilesError?.message
      }]);

      // Add more tests as needed

    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RLS Policy Tester</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runTests}
          disabled={isLoading}
        >
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </Button>
        
        <div className="mt-4 space-y-2">
          {results.map((result, index) => (
            <div key={index} className="p-2 border rounded">
              <div className="font-medium">{result.test}</div>
              <div className={result.result === 'Passed' ? 'text-green-500' : 'text-red-500'}>
                {result.result}
              </div>
              {result.error && (
                <div className="text-sm text-red-400">{result.error}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};