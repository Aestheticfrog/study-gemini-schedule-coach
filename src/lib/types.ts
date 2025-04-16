
export interface Course {
  name: string;
  syllabus: string;
}

export interface Schedule {
  id: string;
  content: string;
  createdAt: string;
}

export interface StudyDay {
  day: string;
  selected: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
