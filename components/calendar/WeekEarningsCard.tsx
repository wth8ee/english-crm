"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Banknote, Clock, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWeekLessons } from "@/lib/actions";
import { getWeekDates } from "@/lib/date";
import { dayNamesShort } from "@/constants/timetable";

interface WeekLesson {
  status: string;
  price: number;
  duration: number;
  date: string;
}

const WEEK_DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function formatDate(dateStr: string) {
  return dateStr.slice(8) + "." + dateStr.slice(5, 7);
}

export function WeekEarningsCard() {
  const [lessons, setLessons] = useState<WeekLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calendarWeekDates = getWeekDates(); // пн–вс текущей недели (7 дней)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const result = await getWeekLessons(calendarWeekDates);
      if (result) {
        setLessons(
          result.map((l) => ({
            status: l.status,
            price: l.price,
            duration: l.duration,
            date: l.date,
          })),
        );
      }
      setIsLoading(false);
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paidLessons = lessons.filter(
    (l) => l.status === "confirmed" || l.status === "completed",
  );
  const scheduledLessons = lessons.filter(
    (l) => l.status === "scheduled" || l.status === "rescheduled",
  );

  const weekIncome = paidLessons.reduce(
    (sum, l) => sum + l.price * (l.duration / 60),
    0,
  );
  const projectedIncome = scheduledLessons.reduce(
    (sum, l) => sum + l.price * (l.duration / 60),
    0,
  );
  const totalProjected = weekIncome + projectedIncome;

  const totalLessons = lessons.filter((l) => l.status !== "cancelled").length;
  const paidCount = paidLessons.length;
  const totalMinutes = paidLessons.reduce((sum, l) => sum + l.duration, 0);
  const hoursWorked = (totalMinutes / 60).toFixed(1);

  // Per-day bar chart (Пн–Вс)
  const maxDayIncome = Math.max(
    ...calendarWeekDates.map((date) => {
      const dayLessons = paidLessons.filter((l) => l.date === date);
      return dayLessons.reduce((s, l) => s + l.price * (l.duration / 60), 0);
    }),
    1,
  );

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Week range label: "07.07 – 13.07"
  const weekStart = formatDate(calendarWeekDates[0]);
  const weekEnd = formatDate(calendarWeekDates[6]);

  const hasPaid = weekIncome > 0;
  const hasProjected = projectedIncome > 0;

  return (
    <div className="rounded-2xl border border-border/40 bg-sidebar shadow-sm p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs font-semibold">Доход за неделю</p>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-muted text-muted-foreground">
          <CalendarRange className="h-2.5 w-2.5" />
          {weekStart} – {weekEnd}
        </div>
      </div>

      {isLoading ? (
        <div className="px-1 space-y-2 pb-1">
          <div className="h-7 w-32 rounded bg-muted animate-pulse" />
          <div className="h-3 w-48 rounded bg-muted animate-pulse" />
        </div>
      ) : (
        <>
          {/* Main amount */}
          <div className="px-1 mb-3">
            <div className="text-2xl font-bold tabular-nums leading-none">
              {weekIncome.toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Оплаченные уроки за текущую неделю
            </p>
          </div>

          {/* Per-day mini bar chart */}
          <div className="px-1 mb-3">
            <div className="flex items-end gap-[3px] h-10">
              {calendarWeekDates.map((date, idx) => {
                const dayLessons = paidLessons.filter((l) => l.date === date);
                const dayIncome = dayLessons.reduce(
                  (s, l) => s + l.price * (l.duration / 60),
                  0,
                );
                const dayScheduled = scheduledLessons.filter(
                  (l) => l.date === date,
                );
                const hasScheduled = dayScheduled.length > 0;
                const heightPct = Math.max(
                  Math.floor((dayIncome / maxDayIncome) * 100),
                  dayIncome > 0 ? 8 : 0,
                );
                const isToday = date === todayStr;
                const isPast = date < todayStr;

                // Day label: Mon=0..Sun=6 in calendarWeekDates, but getWeekDates starts from Mon
                const label = WEEK_DAY_LABELS[idx];

                return (
                  <div
                    key={date}
                    className="flex flex-col items-center gap-1 flex-1 group relative"
                    title={
                      dayIncome > 0
                        ? `${label}: ${dayIncome.toLocaleString("ru-RU")} ₽`
                        : hasScheduled
                          ? `${label}: запланировано`
                          : `${label}: нет уроков`
                    }
                  >
                    {/* Tooltip */}
                    {(dayIncome > 0 || hasScheduled) && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover border border-border/40 rounded px-1 py-0.5 text-[8px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {dayIncome > 0
                          ? `${Math.round(dayIncome)} ₽`
                          : "план"}
                      </div>
                    )}
                    {/* Bar */}
                    <div className="w-full flex-1 flex items-end">
                      {dayIncome > 0 ? (
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={cn(
                            "w-full rounded-sm transition-colors",
                            isToday
                              ? "bg-foreground"
                              : isPast
                                ? "bg-foreground/70"
                                : "bg-foreground/50",
                          )}
                        />
                      ) : hasScheduled ? (
                        <div
                          className="w-full rounded-sm bg-foreground/15"
                          style={{ height: "15%" }}
                        />
                      ) : (
                        <div className="w-full rounded-sm bg-muted" style={{ height: "8%" }} />
                      )}
                    </div>
                    {/* Day label */}
                    <span
                      className={cn(
                        "text-[9px] leading-none",
                        isToday
                          ? "text-foreground font-bold"
                          : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-border/40 mx-1 mb-3" />

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 px-1 mb-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Banknote className="h-3 w-3" />
                <span className="text-[10px]">Уроков</span>
              </div>
              <span className="text-xs font-semibold tabular-nums">
                {paidCount} / {totalLessons}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-[10px]">Отработано</span>
              </div>
              <span className="text-xs font-semibold tabular-nums">
                {hoursWorked} ч
              </span>
            </div>
          </div>

          {/* Projected section */}
          {hasProjected && (
            <>
              <div className="h-px bg-border/40 mx-1 mb-3" />
              <div className="px-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Прогноз (с запланированными)
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums">
                    {totalProjected.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/70 transition-all"
                    style={{
                      width: `${Math.min(Math.round((weekIncome / totalProjected) * 100), 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">
                  {totalProjected > 0
                    ? Math.round((weekIncome / totalProjected) * 100)
                    : 0}
                  % уже оплачено
                </p>
              </div>
            </>
          )}

          {/* Empty state */}
          {!hasPaid && !hasProjected && (
            <div className="px-1 text-center py-2">
              <p className="text-[10px] text-muted-foreground">
                Нет уроков на этой неделе
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
