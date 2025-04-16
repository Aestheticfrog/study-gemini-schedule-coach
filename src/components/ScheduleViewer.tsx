
import { useState, useEffect } from "react";
import { ArrowLeft, CalendarClock, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Schedule } from "@/lib/types";
import { getSchedules, getSchedule } from "@/lib/storage";
import ChatInterface from "./ChatInterface";

interface ScheduleViewerProps {
  currentScheduleId: string | null;
  onBack: () => void;
  onEditComplete: (scheduleId: string, newContent: string) => void;
}

export default function ScheduleViewer({ currentScheduleId, onBack, onEditComplete }: ScheduleViewerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [activeTab, setActiveTab] = useState("schedule");

  // Fetch the current schedule whenever the ID changes OR when edits are made
  useEffect(() => {
    const allSchedules = getSchedules();
    setSchedules(allSchedules);
    
    if (currentScheduleId) {
      const schedule = allSchedules.find(s => s.id === currentScheduleId) || null;
      setCurrentSchedule(schedule);
      if (schedule) {
        setEditContent(schedule.content);
      }
    }
  }, [currentScheduleId]);

  const handleSaveEdit = () => {
    if (currentSchedule && editContent.trim()) {
      onEditComplete(currentSchedule.id, editContent);
      setEditMode(false);
      
      // Update local state
      const updatedSchedule = { ...currentSchedule, content: editContent };
      setCurrentSchedule(updatedSchedule);
      
      setSchedules(prevSchedules => 
        prevSchedules.map(s => 
          s.id === currentSchedule.id ? updatedSchedule : s
        )
      );
    }
  };

  // Handle schedule updates from chat
  const handleScheduleUpdatedFromChat = (scheduleId: string, newContent: string) => {
    onEditComplete(scheduleId, newContent);
    
    // Always fetch the latest version after an update
    const updatedSchedule = getSchedule(scheduleId);
    if (updatedSchedule) {
      setCurrentSchedule(updatedSchedule);
      setEditContent(updatedSchedule.content);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentSchedule) {
    return (
      <Card className="p-6 text-center">
        <p>No schedule selected. Please generate a schedule first.</p>
        <button 
          onClick={onBack}
          className="mt-4 inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </button>
      </Card>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="chat">Chat & Modify</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="schedule" className="space-y-4">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                <CalendarClock className="mr-2 h-5 w-5" /> Study Schedule
              </h2>
              <p className="text-sm text-muted-foreground">
                Created: {formatDate(currentSchedule.createdAt)}
              </p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="inline-flex items-center text-sm font-medium text-primary"
            >
              <Edit className="mr-1 h-4 w-4" /> {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <textarea
                className="w-full p-3 min-h-[400px] border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm">
                {currentSchedule.content}
              </pre>
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="chat">
        <ChatInterface 
          currentSchedule={currentSchedule}
          onScheduleUpdated={handleScheduleUpdatedFromChat}
        />
      </TabsContent>
    </Tabs>
  );
}
