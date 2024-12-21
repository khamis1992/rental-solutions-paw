import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Clipboard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface JobCardActionsProps {
  id: string;
}

export const JobCardActions = ({ id }: JobCardActionsProps) => {
  const navigate = useNavigate();

  const handleInspectionClick = () => {
    navigate(`/maintenance/${id}/inspection`);
  };

  return (
    <CardFooter className="flex flex-col gap-4 pt-4">
      <Button 
        onClick={handleInspectionClick}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <Clipboard className="mr-2 h-5 w-5" />
        Perform Vehicle Inspection
      </Button>
      <p className="text-sm text-muted-foreground flex items-center">
        <AlertCircle className="mr-2 h-4 w-4" />
        AI-powered damage detection available during inspection
      </p>
    </CardFooter>
  );
};