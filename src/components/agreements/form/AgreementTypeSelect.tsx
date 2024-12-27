import { Label } from "@/components/ui/label";
import { CommandSelect } from "@/components/ui/command-select";

interface AgreementTypeSelectProps {
  register: any;
}

const agreementTypeOptions = [
  { value: "lease_to_own", label: "Lease to Own" },
  { value: "short_term", label: "Short Term Rental" },
];

export const AgreementTypeSelect = ({ register }: AgreementTypeSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="agreementType">Agreement Type</Label>
      <CommandSelect
        items={agreementTypeOptions}
        placeholder="Select type"
        onValueChange={(value) =>
          register("agreementType").onChange({
            target: { value },
          })
        }
      />
    </div>
  );
};