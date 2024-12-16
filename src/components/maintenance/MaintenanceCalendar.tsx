import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MaintenanceTask {
  id: string;
  date: Date;
  type: string;
  priority: "high" | "medium" | "low";
}

interface MaintenanceCalendarProps {
  tasks: MaintenanceTask[];
  onDateSelect: (date: Date | undefined) => void;
}

export const MaintenanceCalendar = ({
  tasks,
  onDateSelect,
}: MaintenanceCalendarProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Maintenance Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          onSelect={onDateSelect}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
};