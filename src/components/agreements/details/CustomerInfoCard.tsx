import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, User } from "lucide-react";

interface CustomerInfoCardProps {
  customer: {
    full_name?: string | null;
    phone_number?: string | null;
    address?: string | null;
    status?: string | null;
  };
}

export const CustomerInfoCard = ({ customer }: CustomerInfoCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Customer Information</h3>
          {customer?.status && (
            <Badge 
              variant={customer.status === 'active' ? 'success' : 'secondary'}
              className="ml-2"
            >
              {customer.status}
            </Badge>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-muted-foreground text-sm">Full Name</Label>
              <p className="font-medium">{customer?.full_name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-muted-foreground text-sm">Phone Number</Label>
              <p className="font-medium">{customer?.phone_number || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-muted-foreground text-sm">Address</Label>
              <p className="font-medium">{customer?.address || 'N/A'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};