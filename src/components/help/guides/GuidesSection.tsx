import { GuideCard } from "./GuideCard";

interface Guide {
  id: string;
  title: string;
  steps: string[];
}

interface GuidesSectionProps {
  guides: Guide[];
}

export const GuidesSection = ({ guides }: GuidesSectionProps) => {
  return (
    <div className="space-y-6">
      {guides.map((guide) => (
        <GuideCard key={guide.id} {...guide} />
      ))}
    </div>
  );
};