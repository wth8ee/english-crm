"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  format,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  selectedDate: string; // yyyy-MM-dd
}

const weekDayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function MiniCalendar({ selectedDate }: MiniCalendarProps) {
  const router = useRouter();
  const selected = new Date(selectedDate);
  const [month, setMonth] = useState(startOfMonth(selected));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  const handleSelect = (day: Date) => {
    router.push(`/calendar?date=${format(day, "yyyy-MM-dd")}`);
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-sidebar shadow-sm p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold capitalize px-1">
          {format(month, "LLLL yyyy", { locale: ru })}
        </p>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center mb-1">
        {weekDayNames.map((name) => (
          <span
            key={name}
            className="text-[9px] font-semibold text-muted-foreground/70 uppercase"
          >
            {name}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const isSelected = isSameDay(day, selected);
          const today = isToday(day);
          const inMonth = isSameMonth(day, month);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleSelect(day)}
              className={cn(
                "h-7 w-full text-[11px] rounded-md transition-colors cursor-pointer",
                !inMonth && "text-muted-foreground/40",
                inMonth && !isSelected && "text-foreground/80 hover:bg-muted",
                today && !isSelected && "border border-foreground/25 border-dashed font-semibold",
                isSelected && "bg-primary text-primary-foreground font-semibold",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
