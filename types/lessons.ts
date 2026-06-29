import { Prisma } from "@/generated/prisma/client";

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
