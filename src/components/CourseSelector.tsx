
import { useState, useEffect, useRef } from "react";
import { Check, X, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Course } from "@/lib/types";
import { loadSyllabusFromExcel, findSimilarCourses } from "@/lib/syllabusLoader";

interface CourseSelectorProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onClearCourses: () => void;
}

export default function CourseSelector({ courses, onAddCourse, onClearCourses }: CourseSelectorProps) {
  const [courseName, setCourseName] = useState("");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [suggestions, setSuggestions] = useState<Course[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const courses = await loadSyllabusFromExcel(file);
      setAvailableCourses(courses);
      toast({
        title: "Success",
        description: `Loaded ${courses.length} courses from syllabus file`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load syllabus file",
        variant: "destructive"
      });
    }
  };

  const handleCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseName(value);
    
    if (value.trim()) {
      const matches = findSimilarCourses(value, availableCourses);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddCourse = (course: Course) => {
    if (courses.some(c => c.name.toLowerCase() === course.name.toLowerCase())) {
      toast({ 
        title: "Duplicate Course",
        description: "This course has already been added",
        variant: "destructive" 
      });
      return;
    }
    
    onAddCourse(course);
    setCourseName("");
    setSuggestions([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Syllabus Excel File
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="relative">
          <label className="text-sm font-medium leading-none mb-2 block">Course Name</label>
          <Input
            placeholder="Enter course name"
            value={courseName}
            onChange={handleCourseNameChange}
          />
          
          {suggestions.length > 0 && (
            <Card className="absolute w-full mt-1 z-50 max-h-48 overflow-y-auto">
              <div className="p-2 space-y-1">
                {suggestions.map((course, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => handleAddCourse(course)}
                  >
                    {course.name}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <Button onClick={onClearCourses} variant="outline" className="w-full">
        <X className="mr-2 h-4 w-4" /> Clear All
      </Button>
      
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
                <p className="text-sm text-muted-foreground line-clamp-2">{course.syllabus}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
