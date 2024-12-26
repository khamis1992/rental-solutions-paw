import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CustomerInfoCardProps {
  customer: {
    full_name?: string | null;
    phone_number?: string | null;
    address?: string | null;
  };
}

export const CustomerInfoCard = ({ customer }: CustomerInfoCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <p>{customer?.full_name}</p>
          </div>
          <div>
            <Label>Phone Number</Label>
            <p>{customer?.phone_number}</p>
          </div>
          <div className="col-span-2">
            <Label>Address</Label>
            <p>{customer?.address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};