import { Prisma } from "@/generated/prisma/client";

// Урок в клиентском состоянии календаря (dayIndex — индекс в массиве видимых дат)
export interface finalLesson {
  dayIndex: number;
  time: string;
  student: string;
  status: string;
  level: string;
  id: string;
  duration: number;
  price: number;
  comment: string | null;
  isTrial: boolean;
}

export type LessonWithStudent = Prisma.LessonGetPayload<{
  include: {
    student: true;
  };
}>;

export type ClientLessonWithStudent = Omit<
  LessonWithStudent,
  "createdAt" | "updatedAt" | "date"
> & {
  date: string;
  createdAt: string;
  updatedAt: string;
  student: Omit<LessonWithStudent["student"], "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
  };
};

export interface ConfirmedLessonWithStudentHourlyRate {
  id: string;
  time: string;
  date: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  studentId: string;
  student: {
    hourlyRate: number;
  };
}

export interface TodayLessonWithStudent {
  id: string;
  time: string;
  date: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    level: string;
  };
}
