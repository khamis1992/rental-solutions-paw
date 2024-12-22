import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export const CustomerGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <h3 className="text-lg font-medium">Customer Management</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Managing Customers</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Add new customers with detailed profiles</li>
              <li>Upload and verify identification documents</li>
              <li>Track rental history and payment records</li>
              <li>Manage customer communications and notes</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Document Management</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Upload and store customer IDs and licenses</li>
              <li>Track document expiration dates</li>
              <li>Set up automatic renewal reminders</li>
              <li>Maintain secure document archives</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};