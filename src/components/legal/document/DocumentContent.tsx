import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentContentProps {
  customerData: any;
  isLoading: boolean;
}

export function DocumentContent({ customerData, isLoading }: DocumentContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No document data available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <Card className="p-6 bg-white shadow-sm">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h2 className="text-xl font-semibold mb-4">Legal Agreement</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{customerData.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{customerData.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{customerData.address}</p>
                </div>
              </div>
            </section>

            {customerData.leases?.map((lease: any, index: number) => (
              <section key={index} className="border-t pt-4">
                <h3 className="text-lg font-medium">Lease Details</h3>
                <div className="space-y-4 mt-2">
                  {lease.payment_schedules?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Payment Schedule</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {lease.payment_schedules.map((schedule: any, idx: number) => (
                          <li key={idx} className="text-sm">
                            Due Date: {new Date(schedule.due_date).toLocaleDateString()} - 
                            Amount: QAR {schedule.amount}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lease.damages?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Reported Damages</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {lease.damages.map((damage: any, idx: number) => (
                          <li key={idx} className="text-sm">
                            {damage.description} - Repair Cost: QAR {damage.repair_cost}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Card>
    </ScrollArea>
  );
}