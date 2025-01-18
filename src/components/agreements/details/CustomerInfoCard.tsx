import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CustomerInfoCardProps {
  customer: {
    full_name?: string;
    phone_number?: string;
    address?: string;
  };
}

export const CustomerInfoCard = ({ customer }: CustomerInfoCardProps) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Full Name</Label>
            <p className="text-base font-medium text-gray-900">{customer?.full_name || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
            <p className="text-base font-medium text-gray-900">{customer?.phone_number || 'N/A'}</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium text-gray-600">Address</Label>
            <p className="text-base text-gray-900">{customer?.address || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};