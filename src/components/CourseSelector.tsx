
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Course } from "@/lib/types";

interface CourseSelectorProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onClearCourses: () => void;
}

export default function CourseSelector({ courses, onAddCourse, onClearCourses }: CourseSelectorProps) {
  const [courseName, setCourseName] = useState("");
  const [syllabus, setSyllabus] = useState("");

  const handleAddCourse = () => {
    if (!courseName.trim()) {
      toast({ 
        title: "Error",
        description: "Please enter a course name",
        variant: "destructive" 
      });
      return;
    }
    
    if (!syllabus.trim()) {
      toast({ 
        title: "Error",
        description: "Please enter course syllabus details",
        variant: "destructive" 
      });
      return;
    }
    
    // Check for duplicates
    if (courses.some(c => c.name.toLowerCase() === courseName.toLowerCase())) {
      toast({ 
        title: "Duplicate Course",
        description: "This course has already been added",
        variant: "destructive" 
      });
      return;
    }
    
    onAddCourse({
      name: courseName,
      syllabus: syllabus
    });
    
    // Clear inputs
    setCourseName("");
    setSyllabus("");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Course Name</label>
          <Input
            placeholder="Enter course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Course Syllabus Topics</label>
          <Input
            placeholder="Enter syllabus topics (comma separated)"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={handleAddCourse} className="flex-1">
          <Check className="mr-2 h-4 w-4" /> Add Course
        </Button>
        <Button onClick={onClearCourses} variant="outline" className="flex-1">
          <X className="mr-2 h-4 w-4" /> Clear All
        </Button>
      </div>
      
      <div className="border rounded-lg p-3">
        <h3 className="font-medium mb-2">Added Courses ({courses.length})</h3>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-2">
              No courses added yet
            </p>
          ) : (
            courses.map((course, index) => (
              <Card key={index} className="p-3">
                <h4 className="font-medium">{course.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">{course.syllabus}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
