import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const ScheduleCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicle_schedules")
        .select(`
          *,
          vehicles (
            make,
            model,
            license_plate
          ),
          profiles (
            full_name
          )
        `);

      if (error) throw error;

      const formattedEvents = data.map((schedule) => ({
        id: schedule.id,
        title: `${schedule.schedule_type}: ${schedule.vehicles.license_plate}`,
        start: new Date(schedule.scheduled_time),
        end: new Date(new Date(schedule.scheduled_time).getTime() + 60 * 60 * 1000), // 1 hour duration
        resource: schedule,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to load schedules");
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const { error } = await supabase
        .from("vehicle_schedules")
        .update({ scheduled_time: start })
        .eq("id", event.id);

      if (error) throw error;

      toast.success("Schedule updated successfully");
      fetchSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    }
  };

  return (
    <Card className="p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onEventDrop={handleEventDrop}
        draggableAccessor={() => true}
        defaultView="week"
        views={["day", "week", "month"]}
      />
    </Card>
  );
};