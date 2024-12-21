import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InsuranceFormProps {
  formData: {
    policy_number: string;
    provider: string;
    start_date: string;
    end_date: string;
    coverage_type: string;
    coverage_amount: number;
    premium_amount: number;
  };
  setFormData: (data: any) => void;
}

export const InsuranceForm = ({ formData, setFormData }: InsuranceFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="policy_number">Policy Number</Label>
        <Input
          id="policy_number"
          value={formData.policy_number}
          onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          value={formData.provider}
          onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          id="start_date"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end_date">End Date</Label>
        <Input
          id="end_date"
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coverage_type">Coverage Type</Label>
        <Input
          id="coverage_type"
          value={formData.coverage_type}
          onChange={(e) => setFormData(prev => ({ ...prev, coverage_type: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coverage_amount">Coverage Amount</Label>
        <Input
          id="coverage_amount"
          type="number"
          value={formData.coverage_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, coverage_amount: Number(e.target.value) }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="premium_amount">Premium Amount</Label>
        <Input
          id="premium_amount"
          type="number"
          value={formData.premium_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, premium_amount: Number(e.target.value) }))}
          required
        />
      </div>
    </div>
  );
};