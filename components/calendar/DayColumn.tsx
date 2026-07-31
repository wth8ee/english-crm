"use client";

import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  HOUR_HEIGHT,
  SLOT_MINUTES,
  SLOT_HEIGHT,
  GRID_HEIGHT,
} from "@/constants/timetable";
import { cn } from "@/lib/utils";
import { finalLesson } from "@/types/lessons";
import { LessonCard } from "./LessonCard";

type LessonStatus =
  | "completed"
  | "scheduled"
  | "cancelled"
  | "rescheduled"
  | "confirmed";

interface DayColumnProps {
  date: string;
  isToday: boolean;
  lessons: finalLesson[];
  onSlotClick: (date: string, time: string) => void;
  onChangeStatus: (lessonId: string, status: LessonStatus) => void;
  onDelete: (lessonId: string) => void;
}

export function DayColumn({
  date,
  isToday,
  lessons,
  onSlotClick,
  onChangeStatus,
  onDelete,
}: DayColumnProps) {
  const hoursCount = DAY_END_HOUR - DAY_START_HOUR;
  const hourSlots = Array.from({ length: hoursCount });
  const slotsPerHour = 60 / SLOT_MINUTES;

  const handleSlotClick = (hourIndex: number, slotIndex: number) => {
    const hour = hourIndex + DAY_START_HOUR;
    const minutes = slotIndex * SLOT_MINUTES;
    const timeString = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    onSlotClick(date, timeString);
  };

  return (
    <div
      className={cn(
        "w-full relative group/col",
        isToday && "bg-muted/30",
      )}
      style={{ height: `${GRID_HEIGHT}px` }}
    >
      {/* Фоновые линии сетки */}
      {hourSlots.map((_, hIdx) => {
        const topPosition = hIdx * HOUR_HEIGHT;
        return (
          <div
            key={hIdx}
            className="absolute left-0 w-full pointer-events-none z-0"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            {hIdx !== 0 && (
              <div
                className="absolute left-0 w-full border-b-2 border-border/50"
                style={{ top: `${topPosition}px` }}
              />
            )}
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="absolute left-0 w-full border-b border-border/15"
                style={{ top: `${topPosition + k * SLOT_HEIGHT}px` }}
              />
            ))}
          </div>
        );
      })}

      {/* Кликабельные слоты по 15 минут */}
      {hourSlots.map((_, hIdx) => (
        <div
          key={`click-hour-${hIdx}`}
          className="absolute left-0 w-full"
          style={{ top: `${hIdx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
        >
          {Array.from({ length: slotsPerHour }).map((_, sIdx) => (
            <div
              key={`click-slot-${sIdx}`}
              onClick={() => handleSlotClick(hIdx, sIdx)}
              className="absolute left-0 w-full cursor-pointer transition-colors z-10 hover:bg-foreground/[0.04]"
              style={{ top: `${sIdx * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
              title="Запланировать урок"
            />
          ))}
        </div>
      ))}

      {/* Уроки */}
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
