import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const LegalGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-medium">Legal Module</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Compliance Management</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Track non-compliant customers</li>
              <li>Generate legal notices and documents</li>
              <li>Monitor compliance deadlines</li>
              <li>Maintain legal document archives</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Document Templates</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Access pre-approved legal templates</li>
              <li>Customize document content</li>
              <li>Track document versions</li>
              <li>Set up approval workflows</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};