import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardCheck } from "lucide-react";

export const AgreementManagementGuide = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Rental Agreements Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
              alt="Rental agreements interface"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Managing Rental Agreements</h3>
            <p className="text-muted-foreground">
              Our rental agreement system streamlines the entire rental process, 
              from creation to completion. Learn how to manage agreements efficiently 
              and maintain accurate records.
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Creating Agreements</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Select vehicle and customer information</li>
                  <li>Set rental duration and rates</li>
                  <li>Add optional services and insurance</li>
                  <li>Process deposits and initial payments</li>
                  <li>Generate and sign digital contracts</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Payment Processing</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Handle multiple payment methods</li>
                  <li>Process security deposits</li>
                  <li>Manage recurring payments</li>
                  <li>Track payment history</li>
                  <li>Generate invoices and receipts</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Agreement Management</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Track active and upcoming rentals</li>
                  <li>Process extensions and early returns</li>
                  <li>Handle damage claims and incidents</li>
                  <li>Manage late returns and penalties</li>
                  <li>Archive completed agreements</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};