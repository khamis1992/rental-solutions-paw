import { LegalResearchInterface } from "../research/LegalResearchInterface";
import { ResearchHistory } from "../research/ResearchHistory";

export const CaseDetails = ({ caseId }: { caseId: string }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Case Details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LegalResearchInterface caseId={caseId} />
        <ResearchHistory caseId={caseId} />
      </div>
    </div>
  );
};
