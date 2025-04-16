
import { Schedule, Course, ChatMessage } from "@/lib/types";

const SCHEDULES_KEY = "study_schedules";
const CURRENT_SCHEDULE_KEY = "current_schedule";
const COURSES_KEY = "study_courses";
const CHAT_HISTORY_KEY = "chat_history";

// Initialize local storage with default values if not exist
export function initializeStorage() {
  if (!localStorage.getItem(SCHEDULES_KEY)) {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(COURSES_KEY)) {
    localStorage.setItem(COURSES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CHAT_HISTORY_KEY)) {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify([]));
  }
}

// Schedule management
export function saveSchedule(scheduleContent: string): Schedule {
  const schedules = getSchedules();
  const newSchedule: Schedule = {
    id: Date.now().toString(),
    content: scheduleContent,
    createdAt: new Date().toISOString(),
  };
  
  schedules.push(newSchedule);
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  setCurrentSchedule(newSchedule.id);
  return newSchedule;
}

export function updateSchedule(id: string, content: string): Schedule | null {
  const schedules = getSchedules();
  const index = schedules.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  schedules[index].content = content;
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  return schedules[index];
}

export function getSchedules(): Schedule[] {
  return JSON.parse(localStorage.getItem(SCHEDULES_KEY) || "[]");
}

export function getSchedule(id: string): Schedule | null {
  const schedules = getSchedules();
  return schedules.find(s => s.id === id) || null;
}

export function setCurrentSchedule(id: string | null) {
  localStorage.setItem(CURRENT_SCHEDULE_KEY, id || "");
}

export function getCurrentScheduleId(): string | null {
  const id = localStorage.getItem(CURRENT_SCHEDULE_KEY);
  return id || null;
}

export function getCurrentSchedule(): Schedule | null {
  const id = getCurrentScheduleId();
  return id ? getSchedule(id) : null;
}

// Course management
export function saveCourse(course: Course) {
  const courses = getCourses();
  courses.push(course);
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

export function getCourses(): Course[] {
  return JSON.parse(localStorage.getItem(COURSES_KEY) || "[]");
}

export function clearCourses() {
  localStorage.setItem(COURSES_KEY, JSON.stringify([]));
}

// Chat history management
export function saveChatMessage(message: ChatMessage) {
  const history = getChatHistory();
  history.push(message);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

export function getChatHistory(): ChatMessage[] {
  return JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || "[]");
}

export function clearChatHistory() {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify([]));
}
