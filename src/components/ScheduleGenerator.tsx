
import { useState } from "react";
import { Calendar, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      
      // Parse the input times
      const times = studyTimes.split(',').map(t => t.trim()).filter(Boolean);
      
      const prompt = `Create a detailed, multi-week study schedule for the next 4 weeks.
I've provided starting times for study sessions: ${times.join(', ')}.
Each time represents when a study session can start. Please create sessions starting at these times.
Study only on these days: ${selectedDays.join(', ')}.
Each study session should last no longer than ${maxStudyTime} hours.

IMPORTANT: To prevent ANY overlapping study sessions, please follow this rule:
For ANY set of consecutive study times (sorted chronologically), EACH session MUST end exactly when the next session begins.
This rule applies no matter how far apart the start times are or what the maximum duration is.

For example:
- If sessions start at 9:00, 10:00, and 13:00 with maximum duration of 1.5 hours:
  - 9:00 session MUST end at 10:00 (when the next session starts)
  - 10:00 session MUST end at 13:00 (when the next session starts) 
  - 13:00 session can last up to the maximum duration (${maxStudyTime} hours)
- If sessions start at 15:00, 15:30, and 16:00:
  - 15:00 session MUST end at 15:30 (when the next session starts)
  - 15:30 session MUST end at 16:00 (when the next session starts)
  - 16:00 session can last up to the maximum duration (${maxStudyTime} hours)

Distribute the topics evenly and cover all the syllabus items.
Provide the schedule in a clear format with specific dates and times starting from ${startDate.toISOString().split('T')[0]}.
Include the duration for each study session, ensuring no session exceeds ${maxStudyTime} hours.
If a topic needs more time than available in one session, split it into multiple parts.
Only schedule studies for the specified days and times - do not add extra slots.
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
    <Card className="p-4 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Generate Study Schedule
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select your study days, preferred times, and maximum session length</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h2>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium mb-2 flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> Study Days
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {studyDays.map((day, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox 
                  id={`day-${index}`}
                  checked={day.selected}
                  onCheckedChange={() => toggleDay(index)}
                  className="transition-all duration-200 data-[state=checked]:animate-scale-in"
                />
                <Label 
                  htmlFor={`day-${index}`}
                  className="cursor-pointer select-none transition-colors hover:text-primary"
                >
                  {day.day}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium mb-2 flex items-center">
            <Clock className="mr-2 h-4 w-4" /> Study Times
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter times in 24-hour format (e.g., 09:00, 14:00)</p>
                  <p>Sessions will not overlap - each session ends when the next begins</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          <div className="space-y-2">
            <Input
              placeholder="Enter start times (e.g. 09:00, 14:00, 19:00)"
              value={studyTimes}
              onChange={(e) => setStudyTimes(e.target.value)}
              className="transition-all duration-200 focus:scale-[1.02]"
            />
            <p className="text-xs text-muted-foreground animate-fade-in">
              Enter study start times in 24-hour format (HH:MM) separated by commas. Each time represents when a study session can begin.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium mb-2 flex items-center">
            Maximum Study Session Length
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum duration for any study session</p>
                  <p>Note: Sessions may be shorter to prevent overlaps</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              min={0.5}
              max={3}
              step={0.5}
              value={maxStudyTime}
              onChange={(e) => setMaxStudyTime(parseFloat(e.target.value))}
              className="w-24 transition-all duration-200 focus:scale-[1.02]"
            />
            <span>hours</span>
          </div>
        </div>
        
        <Button 
          onClick={generateSchedule} 
          disabled={isGenerating || courses.length === 0}
          className="w-full transition-all duration-300 hover:scale-[1.02]"
        >
          {isGenerating ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Generate Schedule
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
