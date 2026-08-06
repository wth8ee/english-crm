"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarRange, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ScheduleDialog } from "./ScheduleDialog";
import { dayNamesShort } from "@/constants/timetable";
import { Student } from "@/generated/prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { getVisibleDates } from "@/lib/date";
import { format } from "date-fns";
import {
  deleteLessonById,
  getWeekLessons,
  updateLessonStatus,
} from "@/lib/actions";
import { cn } from "@/lib/utils";
import { finalLesson } from "@/types/lessons";
import { TimeAxis } from "./calendar/TimeAxis";
import { DayColumn } from "./calendar/DayColumn";
import { MiniCalendar } from "./calendar/MiniCalendar";
import { OccupancyCard } from "./calendar/OccupancyCard";
import { WeekEarningsCard } from "./calendar/WeekEarningsCard";

interface CalendarClientProps {
  students: Student[];
  initialUnbookedStudents: Student[];
}

const MIN_COL_WIDTH = 170;

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

  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");

  const currentUrlDate = searchParams.get("date") || todayFormatted;
  const visibleDates = getVisibleDates(currentUrlDate);

  const rangeFormatter = new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "long",
  });
  const rangeText =
    visibleDates.length > 1
      ? `${rangeFormatter.format(new Date(visibleDates[0]))} – ${rangeFormatter.format(new Date(visibleDates[visibleDates.length - 1]))}`
      : rangeFormatter.format(new Date(visibleDates[0]));

  const handleDayShift = (direction: "prev" | "next") => {
    const baseDate = new Date(currentUrlDate);
    baseDate.setDate(baseDate.getDate() + (direction === "next" ? 1 : -1));
    router.push(`/calendar?date=${format(baseDate, "yyyy-MM-dd")}`);
  };

  const handleToday = () => {
    router.push(`/calendar?date=${todayFormatted}`);
  };

  const handleSlotClick = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setIsOpen(true);
  };

  const deleteLesson = async (lessonId: string) => {
    deleteLessonById(lessonId);
    setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
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
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, status } : lesson,
      ),
    );
    updateLessonStatus(lessonId, status);
  };

  useEffect(() => {
    const fetchLessons = async () => {
      const fetchedLessons = await getWeekLessons(visibleDates);
      const newLessons: finalLesson[] = [];
      if (fetchedLessons?.length) {
        for (const key in visibleDates) {
          const day = visibleDates[key];
          for (const lesson of fetchedLessons) {
            if (lesson.date === day) {
              newLessons.push({
                dayIndex: Number(key),
                time: lesson.time,
                student: lesson.student.name,
                status: lesson.status,
                level: lesson.student.level,
                id: lesson.id,
                duration: lesson.duration,
                price: lesson.price,
                comment: lesson.comment,
                isTrial: lesson.isTrial,
              });
            }
          }
        }
      }
      setLessons(newLessons);
    };

    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrlDate]);

  const totalCols = visibleDates.length;
  const gridMinWidth = totalCols * MIN_COL_WIDTH;
  const gridTemplate = `repeat(${totalCols}, minmax(${MIN_COL_WIDTH}px, 1fr))`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Расписание</h1>
          <p className="text-xs text-muted-foreground">
            Планирование занятий и сетка уроков.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs font-medium border-border/40 bg-sidebar"
            onClick={handleToday}
          >
            Сегодня
          </Button>

          <div className="flex items-center border border-border/40 rounded-lg overflow-hidden bg-sidebar shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none border-r border-border/20"
              onClick={() => handleDayShift("prev")}
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>

            <div className="px-3 text-xs font-medium text-foreground flex items-center gap-1.5 whitespace-nowrap">
              <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
              {rangeText}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none border-l border-border/20"
              onClick={() => handleDayShift("next")}
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <Button
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium"
            onClick={() => handleSlotClick(todayFormatted, "09:00")}
          >
            <Plus className="h-4 w-4" />
            Запланировать урок
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-start w-full">
        {/* ──── Главный календарь ──── */}
        <div className="flex-1 min-w-0 rounded-2xl border border-border/40 bg-sidebar shadow-sm flex flex-col overflow-hidden">
          {/* Единый горизонтальный + вертикальный скрол — хедер sticky внутри */}
          <div
            className="overflow-x-auto overflow-y-auto [scrollbar-width:thin]"
            style={{ maxHeight: "calc(100svh - 158px)" }}
          >
            {/* Внутренний контейнер с фиксированной минимальной шириной */}
            <div style={{ minWidth: `${64 + gridMinWidth}px` }}>
              {/* ── Хедер с днями (sticky) ── */}
              <div
                className="flex border-b border-border/40 bg-muted/40 select-none items-center h-[52px] sticky top-0 z-20"
              >
                {/* Заглушка под ось времени */}
                <div className="w-16 flex-shrink-0 h-full border-r border-border/40" />

                <div
                  className="grid h-full divide-x divide-border/40 flex-1"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {visibleDates.map((date) => {
                    const isToday = todayFormatted === date;
                    const dayOfWeek = new Date(date).getDay();

                    return (
                      <div
                        key={date}
                        className={cn(
                          "flex flex-col justify-center items-center h-full transition-colors",
                          isToday &&
                            "bg-muted border-x border-foreground/25 border-dashed",
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
                          {dayNamesShort[dayOfWeek]}
                        </p>
                        <p
                          className={cn(
                            "text-[9px] mt-0.5 font-normal leading-none",
                            isToday
                              ? "text-foreground/60 font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {date.slice(8)}.{date.slice(5, 7)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Тело: ось времени + колонки дней ── */}
              <div className="flex">
                <TimeAxis />
                <div
                  className="grid divide-x divide-border/30 flex-1"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {visibleDates.map((date, idx) => (
                    <DayColumn
                      key={date}
                      date={date}
                      isToday={todayFormatted === date}
                      lessons={lessons.filter((l) => l.dayIndex === idx)}
                      onSlotClick={handleSlotClick}
                      onChangeStatus={changeLessonStatus}
                      onDelete={deleteLesson}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ──── Сайдбар (только xl+) ──── */}
        <aside className="hidden xl:flex flex-col gap-4 w-[290px] shrink-0">
          <MiniCalendar selectedDate={currentUrlDate} />
          <OccupancyCard dates={visibleDates} lessons={lessons} />
          <WeekEarningsCard dates={visibleDates} lessons={lessons} />
        </aside>
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
        weekDates={visibleDates}
        lessons={lessons}
        setLessons={setLessons}
        setUnbookedStudents={setUnbookedStudents}
      />
    </div>
  );
}
