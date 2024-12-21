import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <label className="text-sm font-medium">Policy Number</label>
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
        <label className="text-sm font-medium">Provider</label>
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
        <label className="text-sm font-medium">Coverage Type</label>
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
        <label className="text-sm font-medium">Coverage Amount</label>
        {isEditing ? (
          <Input
            type="number"
            value={formData.coverage_amount}
            onChange={(e) =>
              setFormData({ ...formData, coverage_amount: e.target.value })
            }
          />
        ) : (
          <p className="text-sm">
            {formData.coverage_amount
              ? `$${parseFloat(formData.coverage_amount).toLocaleString()}`
              : "N/A"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Premium Amount</label>
        {isEditing ? (
          <Input
            type="number"
            value={formData.premium_amount}
            onChange={(e) =>
              setFormData({ ...formData, premium_amount: e.target.value })
            }
          />
        ) : (
          <p className="text-sm">
            {formData.premium_amount
              ? `$${parseFloat(formData.premium_amount).toLocaleString()}`
              : "N/A"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Start Date</label>
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
        <label className="text-sm font-medium">End Date</label>
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