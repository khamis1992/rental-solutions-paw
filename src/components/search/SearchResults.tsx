import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SearchResultsProps {
  data: any[];
  entityType: string;
  isLoading: boolean;
}

export const SearchResults = ({ data, entityType, isLoading }: SearchResultsProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">
                {item.full_name || item.agreement_number || item.license_plate}
              </h3>
              <p className="text-sm text-muted-foreground">
                {entityType} ID: {item.id}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/${entityType}/${item.id}`)}
            >
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};