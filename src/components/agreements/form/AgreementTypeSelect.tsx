import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AgreementTypeSelectProps {
  register: any;
}

export const AgreementTypeSelect = ({ register }: AgreementTypeSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="agreementType">Agreement Type</Label>
      <Select
        {...register("agreementType")}
        onValueChange={(value) =>
          register("agreementType").onChange({
            target: { value },
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lease_to_own">Lease to Own</SelectItem>
          <SelectItem value="short_term">Short Term Rental</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};