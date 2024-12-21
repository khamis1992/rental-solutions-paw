import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InsuranceFormData } from "./types";

interface InsuranceFormProps {
  formData: InsuranceFormData;
  setFormData: (data: InsuranceFormData) => void;
  isEditing: boolean;
}

export const InsuranceForm = ({ formData, setFormData, isEditing }: InsuranceFormProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Policy Number</Label>
        {isEditing ? (
          <Input
            value={formData.policy_number}
            onChange={(e) =>
              setFormData({ ...formData, policy_number: e.target.value })
            }
          />
        ) : (
          <p className="text-sm">{formData.policy_number || "N/A"}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Provider</Label>
        {isEditing ? (
          <Input
            value={formData.provider}
            onChange={(e) =>
              setFormData({ ...formData, provider: e.target.value })
            }
          />
        ) : (
          <p className="text-sm">{formData.provider || "N/A"}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Coverage Type</Label>
        {isEditing ? (
          <Input
            value={formData.coverage_type}
            onChange={(e) =>
              setFormData({ ...formData, coverage_type: e.target.value })
            }
          />
        ) : (
          <p className="text-sm">{formData.coverage_type || "N/A"}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Coverage Amount</Label>
        {isEditing ? (
          <Input
            type="number"
            value={formData.coverage_amount}
            onChange={(e) =>
              setFormData({ ...formData, coverage_amount: Number(e.target.value) })
            }
          />
        ) : (
          <p className="text-sm">
            {formData.coverage_amount
              ? `$${formData.coverage_amount.toLocaleString()}`
              : "N/A"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Premium Amount</Label>
        {isEditing ? (
          <Input
            type="number"
            value={formData.premium_amount}
            onChange={(e) =>
              setFormData({ ...formData, premium_amount: Number(e.target.value) })
            }
          />
        ) : (
          <p className="text-sm">
            {formData.premium_amount
              ? `$${formData.premium_amount.toLocaleString()}`
              : "N/A"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Start Date</Label>
        {isEditing ? (
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
          />
        ) : (
          <p className="text-sm">
            {formData.start_date
              ? new Date(formData.start_date).toLocaleDateString()
              : "N/A"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        {isEditing ? (
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
          />
        ) : (
          <p className="text-sm">
            {formData.end_date
              ? new Date(formData.end_date).toLocaleDateString()
              : "N/A"}
          </p>
        )}
      </div>
    </div>
  );
};