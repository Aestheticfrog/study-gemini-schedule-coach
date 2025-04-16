
import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Course, StudyDay } from "@/lib/types";
import { callGeminiAPI } from "@/lib/api";
import { saveSchedule } from "@/lib/storage";

interface ScheduleGeneratorProps {
  courses: Course[];
  onScheduleGenerated: (scheduleId: string) => void;
}

export default function ScheduleGenerator({ courses, onScheduleGenerated }: ScheduleGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxStudyTime, setMaxStudyTime] = useState(1.5);
  const [studyTimes, setStudyTimes] = useState("");
  const [studyDays, setStudyDays] = useState<StudyDay[]>([
    { day: "Monday", selected: false },
    { day: "Tuesday", selected: false },
    { day: "Wednesday", selected: false },
    { day: "Thursday", selected: false },
    { day: "Friday", selected: false },
    { day: "Saturday", selected: false },
    { day: "Sunday", selected: false },
  ]);

  const toggleDay = (index: number) => {
    setStudyDays(days => 
      days.map((day, i) => 
        i === index ? { ...day, selected: !day.selected } : day
      )
    );
  };

  const generateSchedule = async () => {
    // Validate inputs
    const selectedDays = studyDays.filter(day => day.selected).map(day => day.day);
    
    if (selectedDays.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one day for studying",
        variant: "destructive",
      });
      return;
    }
    
    if (!studyTimes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter preferred study times",
        variant: "destructive",
      });
      return;
    }
    
    if (courses.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one course",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 28); // 4 weeks schedule
      
      const prompt = `Create a detailed, multi-week study schedule with each study session being a maximum of ${maxStudyTime} hour(s). 
Based on the given days: ${selectedDays.join(', ')} and preferred study times: ${studyTimes}. 
Distribute the topics evenly and cover all the syllabus items. Provide the schedule in a clear format with specific dates and times starting from ${startDate.toISOString().split('T')[0]}. 
Include the duration each topic needs to be studied. If a topic needs more than ${maxStudyTime} hours, split it into multiple parts.
Only include the days and times mentioned, it is not necessary that the schedule must contain all days and time slots. Do not make any suggestions. Give direct Answer.
Syllabus: ${courses.map(c => `${c.name}: ${c.syllabus}`).join(', ')}`;

      const responseText = await callGeminiAPI(prompt);
      
      // Save the generated schedule
      const newSchedule = saveSchedule(responseText);
      
      // Notify the parent component that a new schedule was generated
      onScheduleGenerated(newSchedule.id);
      
      toast({
        title: "Schedule Generated",
        description: "Your study schedule has been created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate schedule: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Generate Study Schedule</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2 flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> Study Days
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {studyDays.map((day, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox 
                  id={`day-${index}`}
                  checked={day.selected}
                  onCheckedChange={() => toggleDay(index)}
                />
                <Label htmlFor={`day-${index}`}>{day.day}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2 flex items-center">
            <Clock className="mr-2 h-4 w-4" /> Study Times
          </h3>
          <div className="space-y-2">
            <Input
              placeholder="Enter times (comma separated, e.g. 09:00, 14:00, 19:00)"
              value={studyTimes}
              onChange={(e) => setStudyTimes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter preferred study times in 24-hour format (HH:MM), separated by commas
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Maximum Study Session Length</h3>
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              min={0.5}
              max={3}
              step={0.5}
              value={maxStudyTime}
              onChange={(e) => setMaxStudyTime(parseFloat(e.target.value))}
              className="w-24"
            />
            <span>hours</span>
          </div>
        </div>
        
        <Button 
          onClick={generateSchedule} 
          disabled={isGenerating || courses.length === 0}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Schedule"}
        </Button>
      </div>
    </Card>
  );
}
