import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrafficFinesList } from "./TrafficFinesList";
import { TrafficFineImport } from "./TrafficFineImport";
import { TrafficFineStats } from "./TrafficFineStats";
import { Card } from "@/components/ui/card";

export const TrafficFinesDashboard = () => {
  return (
    <div className="space-y-6">
      <TrafficFineStats />
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="list">Traffic Fines List</TabsTrigger>
          <TabsTrigger value="import">Import Fines</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card className="p-6">
            <TrafficFinesList />
          </Card>
        </TabsContent>
        
        <TabsContent value="import">
          <Card className="p-6">
            <TrafficFineImport />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};