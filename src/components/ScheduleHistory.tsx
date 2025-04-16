
import { useState, useEffect } from "react";
import { CalendarDays, Calendar, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Schedule } from "@/lib/types";
import { getSchedules, setCurrentSchedule } from "@/lib/storage";

interface ScheduleHistoryProps {
  onSelectSchedule: (scheduleId: string) => void;
}

export default function ScheduleHistory({ onSelectSchedule }: ScheduleHistoryProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const loadedSchedules = getSchedules();
    setSchedules(loadedSchedules.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, []);

  const handleSelectSchedule = (scheduleId: string) => {
    setCurrentSchedule(scheduleId);
    onSelectSchedule(scheduleId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPreviewText = (content: string) => {
    // Get first 100 characters as preview
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <CalendarDays className="mr-2 h-5 w-5" /> Schedule History
      </h2>
      
      {schedules.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Schedules Yet</h3>
          <p className="text-muted-foreground mt-1">
            Generate a schedule to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card 
              key={schedule.id}
              className="p-3 hover:bg-accent cursor-pointer"
              onClick={() => handleSelectSchedule(schedule.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Schedule from {formatDate(schedule.createdAt)}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {getPreviewText(schedule.content)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
