/**
 * Timetable & Academic Class Schedule Data
 */

export interface TimeSlot {
  id: string;
  timeRange: string;
  isBreak?: boolean;
  breakLabel?: string;
}

export interface ClassSession {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  slotId: string;
  timeRange: string;
  courseCode: string;
  courseTitle: string;
  instructor: string;
  room: string;
  type: "Lecture" | "Lab" | "Tutorial";
  colorClass: string;
}

export const standardTimeSlots: TimeSlot[] = [
  { id: "p1", timeRange: "09:00 AM - 10:00 AM" },
  { id: "p2", timeRange: "10:00 AM - 11:00 AM" },
  { id: "b1", timeRange: "11:00 AM - 11:15 AM", isBreak: true, breakLabel: "Morning Refreshment Break" },
  { id: "p3", timeRange: "11:15 AM - 12:15 PM" },
  { id: "p4", timeRange: "12:15 PM - 01:15 PM" },
  { id: "b2", timeRange: "01:15 PM - 02:00 PM", isBreak: true, breakLabel: "Lunch Break" },
  { id: "p5", timeRange: "02:00 PM - 03:00 PM" },
  { id: "p6", timeRange: "03:00 PM - 04:30 PM" },
];

export const weekDays: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday")[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Sample schedules by branch
export const branchScheduleTemplates: Record<string, Omit<ClassSession, "id" | "timeRange">[]> = {
  cs: [
    // Monday
    { day: "Monday", slotId: "p1", courseCode: "CS301", courseTitle: "Database Management Systems", instructor: "Prof. Ranjith K C", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-primary/40 bg-primary/5 text-primary" },
    { day: "Monday", slotId: "p2", courseCode: "CS302", courseTitle: "Operating Systems Architecture", instructor: "Dr. Madhu S N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-info/40 bg-info/5 text-info" },
    { day: "Monday", slotId: "p3", courseCode: "CS201", courseTitle: "Design & Analysis of Algorithms", instructor: "Prof. Shwetha N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-success/40 bg-success/5 text-success" },
    { day: "Monday", slotId: "p4", courseCode: "CS402", courseTitle: "Software Engineering & Agile", instructor: "Dr. Pooja M", room: "Room 304, CS Block", type: "Tutorial", colorClass: "border-warning/40 bg-warning/5 text-warning" },
    { day: "Monday", slotId: "p5", courseCode: "CS303", courseTitle: "Algorithms & Systems Lab", instructor: "Prof. Ranjith K C", room: "Systems Lab 3", type: "Lab", colorClass: "border-accent/40 bg-accent/5 text-accent" },
    { day: "Monday", slotId: "p6", courseCode: "CS303", courseTitle: "Algorithms & Systems Lab (Continued)", instructor: "Prof. Ranjith K C", room: "Systems Lab 3", type: "Lab", colorClass: "border-accent/40 bg-accent/5 text-accent" },

    // Tuesday
    { day: "Tuesday", slotId: "p1", courseCode: "CS201", courseTitle: "Design & Analysis of Algorithms", instructor: "Prof. Shwetha N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-success/40 bg-success/5 text-success" },
    { day: "Tuesday", slotId: "p2", courseCode: "CS301", courseTitle: "Database Management Systems", instructor: "Prof. Ranjith K C", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-primary/40 bg-primary/5 text-primary" },
    { day: "Tuesday", slotId: "p3", courseCode: "CS401", courseTitle: "Computer Networks & Protocols", instructor: "Dr. Rohit S", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-purple-500/40 bg-purple-500/5 text-purple-600" },
    { day: "Tuesday", slotId: "p4", courseCode: "CS302", courseTitle: "Operating Systems Architecture", instructor: "Dr. Madhu S N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-info/40 bg-info/5 text-info" },
    { day: "Tuesday", slotId: "p5", courseCode: "CS403", courseTitle: "Web Technologies Practical", instructor: "Prof. Ranjith K C", room: "Web Lab 1", type: "Lab", colorClass: "border-accent/40 bg-accent/5 text-accent" },
    { day: "Tuesday", slotId: "p6", courseCode: "CS403", courseTitle: "Web Technologies Practical (Continued)", instructor: "Prof. Ranjith K C", room: "Web Lab 1", type: "Lab", colorClass: "border-accent/40 bg-accent/5 text-accent" },

    // Wednesday
    { day: "Wednesday", slotId: "p1", courseCode: "CS302", courseTitle: "Operating Systems Architecture", instructor: "Dr. Madhu S N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-info/40 bg-info/5 text-info" },
    { day: "Wednesday", slotId: "p2", courseCode: "CS401", courseTitle: "Computer Networks & Protocols", instructor: "Dr. Rohit S", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-purple-500/40 bg-purple-500/5 text-purple-600" },
    { day: "Wednesday", slotId: "p3", courseCode: "CS301", courseTitle: "Database Management Systems", instructor: "Prof. Ranjith K C", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-primary/40 bg-primary/5 text-primary" },
    { day: "Wednesday", slotId: "p4", courseCode: "CS201", courseTitle: "Design & Analysis of Algorithms", instructor: "Prof. Shwetha N", room: "Room 304, CS Block", type: "Tutorial", colorClass: "border-success/40 bg-success/5 text-success" },
    { day: "Wednesday", slotId: "p5", courseCode: "CS402", courseTitle: "Software Engineering & Agile", instructor: "Dr. Pooja M", room: "Seminar Hall 2", type: "Lecture", colorClass: "border-warning/40 bg-warning/5 text-warning" },
    { day: "Wednesday", slotId: "p6", courseCode: "LIB101", courseTitle: "Technical Seminar & Library Hours", instructor: "Faculty Incharge", room: "Central Library", type: "Tutorial", colorClass: "border-muted-foreground/30 bg-muted/20 text-muted-foreground" },

    // Thursday
    { day: "Thursday", slotId: "p1", courseCode: "CS401", courseTitle: "Computer Networks & Protocols", instructor: "Dr. Rohit S", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-purple-500/40 bg-purple-500/5 text-purple-600" },
    { day: "Thursday", slotId: "p2", courseCode: "CS201", courseTitle: "Design & Analysis of Algorithms", instructor: "Prof. Shwetha N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-success/40 bg-success/5 text-success" },
    { day: "Thursday", slotId: "p3", courseCode: "CS302", courseTitle: "Operating Systems Architecture", instructor: "Dr. Madhu S N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-info/40 bg-info/5 text-info" },
    { day: "Thursday", slotId: "p4", courseCode: "CS301", courseTitle: "Database Management Systems", instructor: "Prof. Ranjith K C", room: "Room 304, CS Block", type: "Tutorial", colorClass: "border-primary/40 bg-primary/5 text-primary" },
    { day: "Thursday", slotId: "p5", courseCode: "CS304", courseTitle: "Database Systems Lab", instructor: "Prof. Ranjith K C", room: "Database Lab 2", type: "Lab", colorClass: "border-accent/40 bg-accent/5 text-accent" },
    { day: "Thursday", slotId: "p6", courseCode: "CS304", courseTitle: "Database Systems Lab (Continued)", instructor: "Prof. Ranjith K C", room: "Database Lab 2", type: "Lab", colorClass: "border-accent/40 bg-accent/5 text-accent" },

    // Friday
    { day: "Friday", slotId: "p1", courseCode: "CS402", courseTitle: "Software Engineering & Agile", instructor: "Dr. Pooja M", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-warning/40 bg-warning/5 text-warning" },
    { day: "Friday", slotId: "p2", courseCode: "CS301", courseTitle: "Database Management Systems", instructor: "Prof. Ranjith K C", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-primary/40 bg-primary/5 text-primary" },
    { day: "Friday", slotId: "p3", courseCode: "CS401", courseTitle: "Computer Networks & Protocols", instructor: "Dr. Rohit S", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-purple-500/40 bg-purple-500/5 text-purple-600" },
    { day: "Friday", slotId: "p4", courseCode: "CS201", courseTitle: "Design & Analysis of Algorithms", instructor: "Prof. Shwetha N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-success/40 bg-success/5 text-success" },
    { day: "Friday", slotId: "p5", courseCode: "ECA101", courseTitle: "Student Mentorship & Counselor Hour", instructor: "Faculty Proctors", room: "Proctor Rooms", type: "Tutorial", colorClass: "border-primary/40 bg-primary/5 text-primary" },
    { day: "Friday", slotId: "p6", courseCode: "SPT101", courseTitle: "Sports & Extracurricular Activities", instructor: "Physical Director", room: "Sports Complex", type: "Tutorial", colorClass: "border-green-600/40 bg-green-600/5 text-green-700 dark:text-green-400" },

    // Saturday
    { day: "Saturday", slotId: "p1", courseCode: "CS302", courseTitle: "Operating Systems Architecture", instructor: "Dr. Madhu S N", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-info/40 bg-info/5 text-info" },
    { day: "Saturday", slotId: "p2", courseCode: "CS402", courseTitle: "Software Engineering & Agile", instructor: "Dr. Pooja M", room: "Room 304, CS Block", type: "Lecture", colorClass: "border-warning/40 bg-warning/5 text-warning" },
    { day: "Saturday", slotId: "p3", courseCode: "PROJ101", courseTitle: "Mini Project Review & Ideation", instructor: "HOD & Faculty Panel", room: "Innovation Hub", type: "Lab", colorClass: "border-accent/40 bg-accent/5 text-accent" },
    { day: "Saturday", slotId: "p4", courseCode: "PROJ101", courseTitle: "Mini Project Review (Continued)", instructor: "HOD & Faculty Panel", room: "Innovation Hub", type: "Lab", colorClass: "border-accent/40 bg-accent/5 text-accent" },
  ],
};

export function getTimetableSessions(branchId: string = "cs"): ClassSession[] {
  const templates = branchScheduleTemplates[branchId] || branchScheduleTemplates["cs"];
  const slotMap = new Map(standardTimeSlots.map(s => [s.id, s.timeRange]));

  return templates.map((t, index) => ({
    id: `session-${index + 1}`,
    ...t,
    timeRange: slotMap.get(t.slotId) || "09:00 AM - 10:00 AM",
  }));
}
