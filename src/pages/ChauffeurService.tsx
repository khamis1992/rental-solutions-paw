import { IntelligentScheduling } from "@/components/dashboard/IntelligentScheduling";
import { RecurringScheduleDialog } from "@/components/chauffeur/RecurringScheduleDialog";
import { ScheduleCalendar } from "@/components/chauffeur/ScheduleCalendar";
import { ConflictAlert } from "@/components/chauffeur/ConflictAlert";

const ChauffeurService = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chauffeur Service</h1>
        <RecurringScheduleDialog />
      </div>
      
      <ConflictAlert />
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <ScheduleCalendar />
        </div>
        
        <div className="md:col-span-2">
          <IntelligentScheduling />
        </div>
      </div>
    </div>
  );
};

export default ChauffeurService;