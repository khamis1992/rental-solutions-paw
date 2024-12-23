import { GuideCard } from "./GuideCard";

interface Guide {
  title: string;
  steps: string[];
}

interface GuidesSectionProps {
  guides: Guide[];
}

export const GuidesSection = ({ guides }: GuidesSectionProps) => {
  return (
    <div className="space-y-6">
      {guides.map((guide, index) => (
        <GuideCard key={index} {...guide} />
      ))}
    </div>
  );
};