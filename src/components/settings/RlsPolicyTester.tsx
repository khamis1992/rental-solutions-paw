import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { testRlsPolicies, RlsTestResult } from "@/utils/testRlsPolicies";

export const RlsPolicyTester = () => {
  const [tableName, setTableName] = useState('');
  const [result, setResult] = useState<RlsTestResult>({ success: false });

  const handleTest = async () => {
    const testResult = await testRlsPolicies(tableName);
    setResult(testResult);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Enter table name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
        <Button onClick={handleTest}>Test RLS Policy</Button>
      </div>
      {result && (
        <div className={result.success ? "text-green-600" : "text-red-600"}>
          {result.success ? "Access granted" : `Access denied: ${result.error}`}
        </div>
      )}
    </div>
  );
};