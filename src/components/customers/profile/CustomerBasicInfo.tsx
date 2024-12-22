import { Label } from "@/components/ui/label";

interface CustomerBasicInfoProps {
  profile: any;
}

export const CustomerBasicInfo = ({ profile }: CustomerBasicInfoProps) => {
  return (
    <>
      <div>
        <Label>Full Name</Label>
        <p className="text-lg font-medium">{profile.full_name}</p>
      </div>
      <div>
        <Label>Phone Number</Label>
        <p className="text-lg font-medium">{profile.phone_number}</p>
      </div>
      <div className="col-span-2">
        <Label>Address</Label>
        <p>{profile.address || 'N/A'}</p>
      </div>
      <div className="col-span-2">
        <Label>Driver License</Label>
        <p>{profile.driver_license || 'N/A'}</p>
      </div>
    </>
  );
};