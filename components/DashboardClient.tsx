"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LANGUAGE_LEVELS, LanguageLevelKey } from "@/constants/languages";
import { Lesson, Student } from "@/generated/prisma/client";
import { cn, pluralize } from "@/lib/utils";
import { TodayLessonWithStudent } from "@/types/lessons";
import { Users, Calendar, CreditCard } from "lucide-react";

interface DashboardClientProps {
  students: Student[];
  todayLessons: TodayLessonWithStudent[];
  confirmedLessons: Lesson[] | [];
  thisMonthLessons: Lesson[] | [];
  thisMonthStudents: Student[] | [];
  unbookedStudents: Student[] | [];
}
export function DashboardClient({
  students,
  todayLessons,
  confirmedLessons,
  thisMonthLessons,
  thisMonthStudents,
  unbookedStudents,
}: DashboardClientProps) {
  const activeStudents = students
    ? students.filter((student) => student.status === "ACTIVE")
    : [];

  const thisMonthIncome = thisMonthLessons?.length
    ? thisMonthLessons.reduce(
        (acc, lesson) => lesson.price * (lesson.duration / 60) + acc,
        0,
      )
    : 0;

  const timeSortedTodayLessons = todayLessons.toSorted(
    (a, b) => Number(a.time.slice(0, 2)) - Number(b.time.slice(0, 2)),
  );

  const timeSortedScheduledTodayLessons = timeSortedTodayLessons.filter(
    (lesson) => lesson.status === "scheduled",
  );

  const closestScheduledTodayLesson =
    timeSortedScheduledTodayLessons.length > 0
      ? timeSortedScheduledTodayLessons[0]
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">С возвращением!</h1>
        <p className="text-xs text-muted-foreground">
          Вот что происходит в вашей школе сегодня.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/40 bg-sidebar">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Активные ученики
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {pluralize(
                activeStudents.length,
                "человек",
                "человека",
                "человек",
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              +{thisMonthStudents.length} за этот месяц
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-sidebar">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Уроков сегодня
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {pluralize(
                timeSortedScheduledTodayLessons.length,
                "занятие",
                "занятия",
                "занятий",
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {closestScheduledTodayLesson
                ? `Ближайшее в ${closestScheduledTodayLesson.time}`
                : "Уроки на сегодня закончены"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-sidebar">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Доход (Текущий месяц)
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {thisMonthIncome.toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-[10px] text-muted-foreground">
              Фиксация полученных платежей
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/40 bg-sidebar shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Расписание на сегодня
            </CardTitle>
            <CardDescription className="text-xs">
              План занятий на текущий день
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeSortedTodayLessons.length > 0 ? (
              <div className="space-y-3">
                {timeSortedTodayLessons.map((lesson) => {
                  const inactive =
                    lesson.status === "completed" ||
                    lesson.status === "confirmed";
                  return (
                    <div
                      key={lesson.id}
                      className={
                        lesson.status === "completed" ||
                        lesson.status === "confirmed"
                          ? "flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-background opacity-80"
                          : "flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-background shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_-3px_rgba(0,0,0,0.3)]"
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-semibold text-muted-foreground bg-muted border border-border/30 px-2.5 py-1 rounded-md">
                          {lesson.time}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {lesson.student.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Уровень:{" "}
                            {
                              LANGUAGE_LEVELS[
                                lesson.student.level as LanguageLevelKey
                              ].label.split(" ")[2]
                            }{" "}
                            ({lesson.student.level}){" "}
                            {(lesson.status === "completed" ||
                              lesson.status === "confirmed") &&
                              "• Урок завершен"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {lesson.status === "confirmed" && (
                          <span className="text-[10px] bg-green-500/10 text-green-600 border border-green-500/20 px-2.5 py-0.5 rounded-full font-medium">
                            Оплачен
                          </span>
                        )}
                        {lesson.status === "completed" && (
                          <span className="text-[10px] bg-sky-500/10 text-sky-500 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-medium">
                            Проведен
                          </span>
                        )}
                        {lesson.status === "scheduled" && (
                          <span className="text-[10px] bg-violet-500/10 text-violet-500 border border-violet-500/20 px-2.5 py-0.5 rounded-full font-medium">
                            Ожидается
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border border-dashed border-foreground/25 bg-muted/20 my-auto">
                <p className="text-[14px] font-semibold text-foreground">
                  ✨ На сегодня уроков нет
                </p>
                <p className="text-[11px] text-foreground/60 mt-1 max-w-52.5 leading-tight">
                  Самое время отдохнуть или запланировать новые занятия в
                  календаре
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/40 bg-sidebar shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Не записаны на неделю
            </CardTitle>
            <CardDescription className="text-xs">
              Студенты без активных уроков
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unbookedStudents.length > 0 ? (
              unbookedStudents.map((student) => {
                const levelKey = student.level as LanguageLevelKey;
                const levelData = LANGUAGE_LEVELS[levelKey] || {
                  label: student.level,
                  badgeClass: "bg-muted text-muted-foreground border-border/40",
                };

                return (
                  <div key={student.id} className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-background/50 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                      <span className="text-xs font-semibold text-foreground/90">
                        {student.name}
                      </span>

                      <span
                        className={cn(
                          levelData.badgeClass,
                          "text-[9px] px-2 py-0.5 rounded font-medium border uppercase tracking-wider",
                        )}
                      >
                        Уровень: {student.level}
                        {" - "}
                        {levelData.label.split(" ")[2] || student.level}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center my-auto py-6 px-4 text-center rounded-xl border border-dashed border-foreground/25 bg-muted/20">
                <p className="text-[14px] font-medium text-foreground">
                  ✨ Все ученики записаны
                </p>
                <p className="text-[11px] text-foreground/60 mt-0.5 max-w-50 leading-tight">
                  На этой неделе у всех активных студентов запланированы занятия
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
