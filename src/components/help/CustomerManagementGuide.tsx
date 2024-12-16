import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";

export const CustomerManagementGuide = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Customer Management Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
              alt="Customer management interface"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Managing Customer Relationships</h3>
            <p className="text-muted-foreground">
              Effective customer management is crucial for rental business success. 
              Our CRM tools help you maintain strong relationships with your customers 
              and provide excellent service.
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Customer Profiles</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create and update detailed customer profiles</li>
                  <li>Store contact information and preferences</li>
                  <li>Track rental history and payment records</li>
                  <li>Manage customer documents and verifications</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Communication Tools</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Send automated rental reminders</li>
                  <li>Manage customer feedback and reviews</li>
                  <li>Schedule follow-up communications</li>
                  <li>Track customer interactions and notes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Customer Analytics</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>View rental frequency and preferences</li>
                  <li>Track customer satisfaction metrics</li>
                  <li>Analyze customer spending patterns</li>
                  <li>Generate customer loyalty reports</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};