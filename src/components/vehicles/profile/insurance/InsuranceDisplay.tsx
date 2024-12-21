import React from "react";

interface InsuranceDisplayProps {
  insurance?: {
    policy_number: string;
    provider: string;
    start_date: string;
    end_date: string;
    coverage_type: string;
    coverage_amount: number;
    premium_amount: number;
    status: string;
  };
}

export const InsuranceDisplay = ({ insurance }: InsuranceDisplayProps) => {
  return (
    <dl className="grid grid-cols-2 gap-4">
      <div>
        <dt className="font-medium">Policy Number</dt>
        <dd>{insurance?.policy_number || "Not set"}</dd>
      </div>
      <div>
        <dt className="font-medium">Provider</dt>
        <dd>{insurance?.provider || "Not set"}</dd>
      </div>
      <div>
        <dt className="font-medium">Start Date</dt>
        <dd>{insurance?.start_date || "Not set"}</dd>
      </div>
      <div>
        <dt className="font-medium">End Date</dt>
        <dd>{insurance?.end_date || "Not set"}</dd>
      </div>
      <div>
        <dt className="font-medium">Coverage Type</dt>
        <dd>{insurance?.coverage_type || "Not set"}</dd>
      </div>
      <div>
        <dt className="font-medium">Coverage Amount</dt>
        <dd>{insurance?.coverage_amount ? `${insurance.coverage_amount} QAR` : "Not set"}</dd>
      </div>
      <div>
        <dt className="font-medium">Premium Amount</dt>
        <dd>{insurance?.premium_amount ? `${insurance.premium_amount} QAR` : "Not set"}</dd>
      </div>
      <div>
        <dt className="font-medium">Status</dt>
        <dd className="capitalize">{insurance?.status || "Not set"}</dd>
      </div>
    </dl>
  );
};