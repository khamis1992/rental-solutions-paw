import { IntelligentScheduling } from "@/components/dashboard/IntelligentScheduling";

const ChauffeurService = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Chauffeur Service</h1>
      <IntelligentScheduling />
    </div>
  );
};

export default ChauffeurService;