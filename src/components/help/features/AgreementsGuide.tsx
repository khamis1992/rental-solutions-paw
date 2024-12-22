import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const AgreementsGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-medium">Agreements Module</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Creating Agreements</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Select customers from existing database</li>
              <li>Choose available vehicles</li>
              <li>Set rental duration and payment terms</li>
              <li>Apply promotional codes or discounts</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Managing Agreements</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Track agreement status and renewals</li>
              <li>Process extensions and early returns</li>
              <li>Handle damage claims and penalties</li>
              <li>Generate agreement documents</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};