import { Card } from "@/components/ui/card";
import { Steps } from "@/components/ui/steps";

interface GuideCardProps {
  title: string;
  steps: string[];
}

export const GuideCard = ({ title, steps }: GuideCardProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-medium mb-4 text-left">{title}</h3>
      <Steps items={steps} />
    </Card>
  );
};