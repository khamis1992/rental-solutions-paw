import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const RlsPolicyTester = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testPolicies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      setResults([
        {
          test: 'Read profiles',
          result: error ? 'Failed' : 'Passed',
          error: error?.message
        }
      ]);
    } catch (error: any) {
      setResults([
        {
          test: 'Read profiles',
          result: 'Failed',
          error: error.message
        }
      ]);
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
        <Button onClick={testPolicies} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Policies'}
        </Button>
        {results.length > 0 && (
          <div className="mt-4">
            {results.map((result, index) => (
              <div key={index} className="mb-2">
                <strong>{result.test}:</strong>{' '}
                <span className={result.result === 'Passed' ? 'text-green-500' : 'text-red-500'}>
                  {result.result}
                </span>
                {result.error && (
                  <div className="text-sm text-red-500">{result.error}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};