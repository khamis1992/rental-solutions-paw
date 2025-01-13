import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { testTableAccess } from "@/utils/testRlsPolicies";

export const RlsPolicyTester = () => {
  const [tableName, setTableName] = useState("");
  const [result, setResult] = useState<{success: boolean; error?: string} | null>(null);

  const handleTest = async () => {
    if (!tableName) return;
    const testResult = await testTableAccess(tableName);
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
        <Button onClick={handleTest}>Test Access</Button>
      </div>

      {result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          {result.success ? (
            <p className="text-green-700">Access granted to {tableName}</p>
          ) : (
            <p className="text-red-700">Access denied: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};