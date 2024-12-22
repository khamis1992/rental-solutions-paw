import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export const HelpGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          <h3 className="text-lg font-medium">Help Center</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Using the Help Center</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Search for specific topics or features</li>
              <li>Access step-by-step guides</li>
              <li>View frequently asked questions</li>
              <li>Contact support for assistance</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Support Resources</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Browse documentation by category</li>
              <li>Watch tutorial videos</li>
              <li>Access troubleshooting guides</li>
              <li>Submit support tickets</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};