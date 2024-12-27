import { EnhancedSelect } from "@/components/ui/enhanced-select";
import { Label } from "@/components/ui/label";

interface AgreementTypeSelectProps {
  register: any;
}

export const AgreementTypeSelect = ({ register }: AgreementTypeSelectProps) => {
  const agreementTypes = [
    { value: "lease_to_own", label: "Lease to Own" },
    { value: "short_term", label: "Short Term Rental" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="agreementType">Agreement Type</Label>
      <EnhancedSelect
        options={agreementTypes}
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