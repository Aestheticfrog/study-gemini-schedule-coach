
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { BookOpen, Calendar } from "lucide-react";
import CourseSelector from "@/components/CourseSelector";
import ScheduleGenerator from "@/components/ScheduleGenerator";
import ScheduleViewer from "@/components/ScheduleViewer";
import ScheduleHistory from "@/components/ScheduleHistory";
import { Course } from "@/lib/types";
import { saveCourse, getCourses, clearCourses, initializeStorage, updateSchedule } from "@/lib/storage";
import { AuthButton } from "@/components/AuthButton";

const Index = () => {
  const [activeTab, setActiveTab] = useState("setup");
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(null);
  
  // Initialize storage and load courses on component mount
  useEffect(() => {
    initializeStorage();
    const loadedCourses = getCourses();
    setCourses(loadedCourses);
  }, []);
  
  const handleAddCourse = (course: Course) => {
    saveCourse(course);
    setCourses([...courses, course]);
  };
  
  const handleClearCourses = () => {
    clearCourses();
    setCourses([]);
  };
  
  const handleScheduleGenerated = (scheduleId: string) => {
    setCurrentScheduleId(scheduleId);
    setActiveTab("viewSchedule");
  };
  
  const handleSelectSchedule = (scheduleId: string) => {
    setCurrentScheduleId(scheduleId);
    setActiveTab("viewSchedule");
  };
  
  const handleBackToSetup = () => {
    setActiveTab("setup");
  };
  
  const handleScheduleUpdated = (scheduleId: string, newContent: string) => {
    updateSchedule(scheduleId, newContent);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Study Schedule Coach</h1>
          <p className="text-muted-foreground">
            Create personalized study schedules with AI assistance
          </p>
        </div>
        <AuthButton />
      </header>
      
      {activeTab === "viewSchedule" ? (
        <ScheduleViewer 
          currentScheduleId={currentScheduleId}
          onBack={handleBackToSetup}
          onEditComplete={handleScheduleUpdated}
        />
      ) : (
        <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Setup & Generate
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">Course Setup</h2>
                <CourseSelector 
                  courses={courses}
                  onAddCourse={handleAddCourse}
                  onClearCourses={handleClearCourses}
                />
              </Card>
              
              <ScheduleGenerator 
                courses={courses}
                onScheduleGenerated={handleScheduleGenerated}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <ScheduleHistory onSelectSchedule={handleSelectSchedule} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Index;
