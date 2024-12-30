import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewLegalCaseDialog } from "./ViewLegalCaseDialog";
import { LegalCase } from "@/types/legal";

export const LegalCasesList = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const { data: legalCases, isLoading } = useQuery({
    queryKey: ["legal-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_cases")
        .select("*");

      if (error) throw error;
      return data as LegalCase[];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Legal Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {legalCases?.map((caseItem) => (
              <li key={caseItem.id} className="flex justify-between items-center">
                <span>{caseItem.case_type}</span>
                <Button onClick={() => setSelectedCaseId(caseItem.id)}>View Details</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <ViewLegalCaseDialog
        caseId={selectedCaseId}
        open={!!selectedCaseId}
        onOpenChange={(open) => !open && setSelectedCaseId(null)}
      />
    </div>
  );
};
