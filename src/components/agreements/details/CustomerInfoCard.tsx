import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, Flag } from "lucide-react";

interface CustomerInfoCardProps {
  customer: {
    full_name: string;
    phone_number?: string;
    email?: string;
    address?: string;
    nationality?: string;
  };
}

export const CustomerInfoCard = ({ customer }: CustomerInfoCardProps) => {
  return (
    <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-orange-500" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Name</div>
            <div className="font-semibold">{customer.full_name}</div>
          </div>
          
          {customer.phone_number && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                Phone
              </div>
              <div>{customer.phone_number}</div>
            </div>
          )}

          {customer.email && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                Email
              </div>
              <div>{customer.email}</div>
            </div>
          )}

          {customer.address && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                Address
              </div>
              <div>{customer.address}</div>
            </div>
          )}

          {customer.nationality && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flag className="h-4 w-4 text-orange-500" />
                Nationality
              </div>
              <div>{customer.nationality}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};