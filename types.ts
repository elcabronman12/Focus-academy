
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum SchoolClass {
  KG1 = 'KG1',
  KG2 = 'KG2',
  G1 = 'Grade 1',
  G2 = 'Grade 2',
  G3 = 'Grade 3',
  G4 = 'Grade 4'
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface Teacher {
  id: string;
  fullName: string;
  gender: Gender;
  phoneNumber: string;
  email?: string; // Optional
  specialization?: string; // Optional
  yearStarted: number;
  yearEnded?: number; // Null if still working
  isActive: boolean;
}

export interface TimetableEntry {
  id: string;
  classId: SchoolClass;
  day: DayOfWeek;
  periodNumber: number; // 1-5
  subject: string;
  teacherId: string;
  startTime: string;
  endTime: string;
}

export interface Lesson {
  id: string;
  classId: SchoolClass;
  subject: string;
  teacherId: string;
  date: string; // ISO string
  periodNumber: number;
  whiteboardImage: string; // Base64 or local URL
  timeTaught: string;
}

export interface Homework {
  id: string;
  classId: SchoolClass;
  subject: string;
  date: string;
  description: string;
  image?: string;
}

export interface AppState {
  currentUser: string | null;
  teachers: Teacher[];
  timetable: TimetableEntry[];
  lessons: Lesson[];
  homework: Homework[];
  githubToken?: string;
  githubGistId?: string;
}
