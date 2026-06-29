"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ScheduleDialog } from "./ScheduleDialog";
import { daysOfWeek, timeSlots } from "@/constants/timetable";
import { Student } from "@/generated/prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { getWeekDates } from "@/lib/date";
import { format } from "date-fns";
import {
  deleteLessonById,
  getWeekLessons,
  updateLessonStatus,
} from "@/lib/actions";
import { cn, shorten } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface CalendarClientProps {
  students: Student[];
  initialUnbookedStudents: Student[];
}

export interface finalLesson {
  dayIndex: number;
  time: string;
  student: string;
  status: string;
  level: string;
  id: string;
  duration: number;
  price: number;
}

export function CalendarClient({
  students,
  initialUnbookedStudents,
}: CalendarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<
    undefined | string
  >(undefined);
  const [selectedDate, setSelectedDate] = useState<undefined | string>(
    undefined,
  );

  const [unbookedStudents, setUnbookedStudents] = useState<Student[]>(
    initialUnbookedStudents || [],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lessons, setLessons] = useState<finalLesson[]>([]);

  const currentUrlDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];
  const weekDates = getWeekDates(currentUrlDate);
  const formatLongDateRange = (dates: string[]) => {
    const formatter = new Intl.DateTimeFormat("ru", {
      day: "numeric",
      month: "long",
    });
    const firstDay = formatter.format(new Date(dates[0]));
    const lastDay = formatter.format(new Date(dates[6]));
    return `${firstDay} – ${lastDay}`;
  };
  const weekRangeText = formatLongDateRange(weekDates);

  const handleWeekChange = (direction: "prev" | "next") => {
    const baseDate = new Date(currentUrlDate);
    const daysOffset = direction === "next" ? 7 : -7;
    baseDate.setDate(baseDate.getDate() + daysOffset);

    const newDateStr = baseDate.toISOString().split("T")[0];
    router.push(`/calendar?date=${newDateStr}`);
  };

  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");

  const handleCellClick = (time: string, date: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setIsOpen(true);
  };

  const deleteLesson = async (lessonId: string) => {
    deleteLessonById(lessonId);
    const newLessons = lessons.filter((lesson) => lesson.id != lessonId);
    setLessons(newLessons);
  };

  const changeLessonStatus = async (
    lessonId: string,
    status:
      | "completed"
      | "scheduled"
      | "cancelled"
      | "rescheduled"
      | "confirmed",
  ) => {
    const newLessons = lessons.map((lesson) =>
      lesson.id === lessonId ? { ...lesson, status: status } : lesson,
    );
    setLessons(newLessons);
    updateLessonStatus(lessonId, status);
  };

  useEffect(() => {
    const fetchLessons = async () => {
      const fetchedLessons = await getWeekLessons(weekDates);
      const newLessons: finalLesson[] = [];
      if (fetchedLessons?.length) {
        for (const key in weekDates) {
          const day = weekDates[key];
          for (const lesson of fetchedLessons) {
            if (lesson.date === day) {
              const newLesson = {
                dayIndex: Number(key),
                time: lesson.time,
                student: lesson.student.name,
                status: lesson.status,
                level: lesson.student.level,
                id: lesson.id,
                duration: lesson.duration,
                price: lesson.price,
              };
              newLessons.push(newLesson);
            }
          }
        }
      }
      setLessons(newLessons);
    };

    fetchLessons();
  }, [currentUrlDate]);

  const plannedHours =
    lessons.length > 0
      ? lessons.reduce((acc, lesson) => acc + lesson.duration / 60, 0)
      : 0;
  const finishedHours =
    lessons.length > 0
      ? lessons.reduce(
          (acc, lesson) =>
            ["confirmed", "completed"].includes(lesson.status)
              ? acc + lesson.duration / 60
              : acc,
          0,
        )
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Расписание</h1>
          <p className="text-xs text-muted-foreground">
            Планирование занятий и сетка уроков на неделю.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center border border-border/40 rounded-lg overflow-hidden bg-sidebar shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none border-r border-border/20"
              onClick={() => handleWeekChange("prev")}
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>

            <div className="px-3 text-xs font-medium text-foreground flex items-center gap-1.5 whitespace-nowrap">
              <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
              {weekRangeText}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none border-l border-border/20"
              onClick={() => handleWeekChange("next")}
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <Button
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium"
            onClick={() =>
              handleCellClick(
                "09:00",
                format(new Date(), "yyyy.MM.dd").split(".").join("-"),
              )
            }
          >
            <Plus className="h-4 w-4" />
            Запланировать урок
          </Button>
        </div>
      </div>

      <div className="w-full">
        <Card className="w-full border-border/40 bg-sidebar shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-8 border-b border-border/40 bg-muted/40 text-center min-h-12 items-center shrink-0 py-1">
              <div className="text-[10px] font-semibold text-muted-foreground">
                Время
              </div>
              {weekDates.map((date, idx) => {
                const isToday = todayFormatted === date;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col justify-center items-center h-9 rounded-lg mx-0.5 transition-colors",
                      isToday &&
                        "bg-muted border border-foreground/25 border-dashed shadow-[0_1px_3px_rgba(0,0,0,0.02)]",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-semibold leading-none",
                        isToday
                          ? "text-foreground font-bold"
                          : "text-foreground/80",
                      )}
                    >
                      {daysOfWeek[idx].name}
                    </p>
                    <p
                      className={cn(
                        "text-[9px] mt-0.5 font-normal leading-none",
                        isToday
                          ? "text-foreground/60 font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {date
                        .slice(date.length - 5, date.length)
                        .split("-")
                        .join(".")}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="divide-y divide-border/30">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="grid grid-cols-8 h-12 divide-x divide-border/20"
                >
                  <div className="text-[10px] font-medium text-muted-foreground/80 flex items-center justify-center bg-muted/10">
                    {slot}
                  </div>

                  {weekDates.map((date, dayIdx) => {
                    const isToday = todayFormatted === date;
                    const currentHour = parseInt(slot.split(":")[0]);
                    const lesson = lessons.find((l) => {
                      const lessonHour = parseInt(l.time.split(":")[0]);
                      return (
                        l.dayIndex === dayIdx && lessonHour === currentHour
                      );
                    });
                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          "p-0.5 relative group cursor-pointer transition-colors",
                          isToday
                            ? "bg-muted/40 hover:bg-muted border-dashed border-foreground/25 border-l border-r"
                            : "bg-background/20 hover:bg-foreground/1",
                        )}
                        onClick={() => !lesson && handleCellClick(slot, date)}
                      >
                        {lesson ? (
                          <DropdownMenu key={dayIdx}>
                            <DropdownMenuTrigger asChild>
                              <div
                                className={cn(
                                  "absolute inset-0.5 px-2 rounded border flex items-center justify-between overflow-hidden transition-all shadow-[0_1px_4px_-1px_rgba(0,0,0,0.02)] cursor-pointer select-none",

                                  lesson.status === "completed" &&
                                    lesson.status === "completed" &&
                                    "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 font-medium",
                                  lesson.status === "confirmed" &&
                                    "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold",
                                  lesson.status === "cancelled" &&
                                    "bg-destructive/10 border-destructive/20 text-destructive opacity-60 [&_p]:line-through",

                                  lesson.status === "scheduled" &&
                                    "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400",
                                  lesson.status === "rescheduled" &&
                                    "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
                                )}
                              >
                                <div className="flex items-center gap-2 w-full min-w-0">
                                  <span className="text-[10px] font-bold tracking-tight shrink-0">
                                    {lesson.time}
                                  </span>

                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {/* <p className="text-[10px] font-semibold truncate">
                                      {lesson.student.split(" ").length > 1
                                        ? `${lesson.student.split(" ")[0]} ${lesson.student.split(" ")[1][0]}.`
                                        : lesson.student}
                                    </p> */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <p className="text-[10px] font-semibold truncate">
                                          {shorten(lesson.student)}
                                        </p>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="bg-popover text-popover-foreground border border-border/40 text-[10px] font-medium px-2 py-1 rounded-md shadow-md"
                                      >
                                        {lesson.student}
                                      </TooltipContent>
                                    </Tooltip>

                                    {/* {lesson.status === "completed" && (
                                      <Clock className="h-3 w-3 text-sky-600 shrink-0" />
                                    )}

                                    {lesson.status === "confirmed" && (
                                      <BanknoteCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    )}

                                    {lesson.status === "scheduled" && (
                                      <Hourglass className="h-3 aspect-square text-violet-600 dark:text-violet-400 shrink-0" />
                                    )} */}
                                  </div>

                                  <div className="flex gap-1">
                                    <span
                                      className={cn(
                                        "text-[8px] font-bold uppercase tracking-wider border px-1 py-0.5 rounded shrink-0",
                                        lesson.status === "completed" &&
                                          "bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/30",
                                        lesson.status === "scheduled" &&
                                          "bg-violet-500/10 dark:bg-violet-500/15 border-violet-500/30",
                                        lesson.status === "confirmed" &&
                                          "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30",
                                      )}
                                    >
                                      {lesson.duration / 60} ч.
                                    </span>

                                    <span
                                      className={cn(
                                        "text-[8px] font-bold uppercase tracking-wider border px-1 py-0.5 rounded shrink-0",
                                        lesson.status === "completed" &&
                                          "bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/30",
                                        lesson.status === "scheduled" &&
                                          "bg-violet-500/10 dark:bg-violet-500/15 border-violet-500/30",
                                        lesson.status === "confirmed" &&
                                          "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30",
                                      )}
                                    >
                                      {lesson.level}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="center"
                              sideOffset={6}
                              className="bg-sidebar/95 backdrop-blur-md border border-border/50 text-xs min-w-46.25 p-1.5 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] animate-in fade-in-50 zoom-in-95"
                            >
                              {lesson.status !== "completed" &&
                                lesson.status !== "confirmed" &&
                                lesson.status !== "cancelled" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        changeLessonStatus(
                                          lesson.id,
                                          "completed",
                                        )
                                      }
                                      className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                                    >
                                      <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                                      <span className="font-medium tracking-tight">
                                        Завершить урок
                                      </span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      disabled
                                      className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                                    >
                                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                                      <span className="font-medium tracking-tight">
                                        Перенести
                                      </span>
                                    </DropdownMenuItem>

                                    <div className="h-px bg-border/40 my-1.5 mx-1" />

                                    <DropdownMenuItem
                                      onClick={() => deleteLesson(lesson.id)}
                                      className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-destructive/90 transition-colors select-none outline-none focus:bg-destructive/10 focus:text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                                    >
                                      <span className="h-2 w-2 rounded-full bg-destructive shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                                      <span className="font-medium tracking-tight">
                                        Отменить урок
                                      </span>
                                    </DropdownMenuItem>
                                  </>
                                )}

                              {lesson.status === "completed" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      changeLessonStatus(lesson.id, "confirmed")
                                    }
                                    className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                                  >
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                    <span className="font-medium tracking-tight">
                                      Отметить как оплачен
                                    </span>
                                  </DropdownMenuItem>

                                  <div className="h-px bg-border/40 my-1.5 mx-1" />

                                  <DropdownMenuItem
                                    onClick={() =>
                                      changeLessonStatus(lesson.id, "scheduled")
                                    }
                                    className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                                  >
                                    <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                                    <span className="font-medium tracking-tight">
                                      Вернуть в ожидание
                                    </span>
                                  </DropdownMenuItem>
                                </>
                              )}

                              {(lesson.status === "confirmed" ||
                                lesson.status === "cancelled") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      changeLessonStatus(lesson.id, "completed")
                                    }
                                    className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                                  >
                                    <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                                    <span className="font-medium tracking-tight">
                                      Отметить как не оплачен
                                    </span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      changeLessonStatus(lesson.id, "scheduled")
                                    }
                                    className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                                  >
                                    <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                                    <span className="font-medium tracking-tight">
                                      Вернуть в ожидание
                                    </span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>{" "}
                          </DropdownMenu>
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* <div className="lg:col-span-3 space-y-4">
          <Card className="border-border/40 bg-sidebar shadow-sm">
            <CardHeader className="p-4 pb-2 space-y-0.5">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Итоги недели
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Clock className="h-3.5 w-3.5 text-sky-500" />
                  <span>Запланировано</span>
                </div>
                <span className="text-xs font-bold">{plannedHours} ч</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <UserCheck className="h-3.5 w-3.5 text-green-500" />
                  <span>Отработано</span>
                </div>
                <span className="text-xs font-bold">{finishedHours} ч</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-sidebar shadow-sm">
            <CardHeader className="p-4 pb-2 space-y-0.5">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Не записаны
              </CardTitle>
              <CardDescription className="text-[10px]">
                Без уроков на этой неделе
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {unbookedStudents.length > 0 ? (
                  unbookedStudents.map((student) => {
                    const levelKey = student.level as LanguageLevelKey;
                    const levelData = LANGUAGE_LEVELS[levelKey] || {
                      label: student.level,
                      badgeClass:
                        "bg-muted text-muted-foreground border-border/40",
                    };

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-background/50 shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
                      >
                        <span className="text-xs font-semibold text-foreground/90">
                          {student.name}
                        </span>

                        <span
                          className={cn(
                            levelData.badgeClass,
                            "text-[9px] px-2 py-0.5 rounded font-medium border uppercase tracking-wider whitespace-nowrap",
                          )}
                        >
                          {student.level}
                          {" - "}
                          {levelData.label.split(" ")[2] || student.level}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center rounded-xl border border-dashed border-foreground/25 bg-muted/20">
                    <p className="text-[14px] font-semibold text-foreground/75">
                      ✨ Все ученики записаны
                    </p>
                    <p className="text-[11px] text-foreground/50 mt-0.5 max-w-47.5 leading-tight">
                      У всех активных студентов в расписании есть хотя бы один
                      урок
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>

      <ScheduleDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        students={students}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        error={error}
        setError={setError}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        weekDates={weekDates}
        lessons={lessons}
        setLessons={setLessons}
        setUnbookedStudents={setUnbookedStudents}
      />
    </div>
  );
}
