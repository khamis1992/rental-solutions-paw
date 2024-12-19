import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardActionsProps {
  id: string;
}

export const JobCardActions = ({ id }: JobCardActionsProps) => {
  const navigate = useNavigate();

  const handleInspectionClick = () => {
    navigate(`/maintenance/${id}/inspection`);
  };

  return (
    <CardFooter className="pt-4">
      <Button 
        onClick={handleInspectionClick}
        className="w-full"
        variant="outline"
      >
        <Camera className="w-4 h-4 mr-2" />
        Perform Vehicle Inspection
      </Button>
    </CardFooter>
  );
};