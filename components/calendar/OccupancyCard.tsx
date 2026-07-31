import { WORKDAY_MINUTES, dayNamesShort } from "@/constants/timetable";
import { finalLesson } from "@/types/lessons";
import { cn } from "@/lib/utils";

interface OccupancyCardProps {
  dates: string[];
  lessons: finalLesson[];
}

function formatMinutes(minutes: number) {
  if (minutes === 0) return "0 ч";
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours === 0) return `${rem} мин`;
  return rem > 0 ? `${hours} ч ${rem} мин` : `${hours} ч`;
}

export function OccupancyCard({ dates, lessons }: OccupancyCardProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const perDay = dates.map((date, idx) => {
    const bookedMinutes = lessons
      .filter((l) => l.dayIndex === idx && l.status !== "cancelled")
      .reduce((sum, l) => sum + l.duration, 0);
    const percent = Math.min(Math.round((bookedMinutes / WORKDAY_MINUTES) * 100), 100);
    return { date, bookedMinutes, percent };
  });

  const totalMinutes = perDay.reduce((sum, d) => sum + d.bookedMinutes, 0);
  const avgPercent =
    perDay.length > 0
      ? Math.round(perDay.reduce((sum, d) => sum + d.percent, 0) / perDay.length)
      : 0;

  return (
    <div className="rounded-2xl border border-border/40 bg-sidebar shadow-sm p-3">
      <p className="text-xs font-semibold mb-2.5 px-1">Занятость</p>

      <div className="space-y-2.5">
        {perDay.map(({ date, bookedMinutes, percent }) => {
          const dayOfWeek = new Date(date).getDay();
          const isToday = date === todayStr;
          const label = date.slice(8) + "." + date.slice(5, 7);

          return (
            <div key={date} className="px-1">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-[11px]",
                    isToday
                      ? "font-bold text-foreground"
                      : "font-medium text-foreground/80",
                  )}
                >
                  {dayNamesShort[dayOfWeek]} {label}
                  {isToday && (
                    <span className="ml-1 text-[9px] font-normal text-muted-foreground">
                      сегодня
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {formatMinutes(bookedMinutes)} · {percent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    percent >= 80
                      ? "bg-emerald-500"
                      : percent >= 40
                        ? "bg-violet-500"
                        : "bg-violet-400/60",
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-border/40 my-3" />

      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          Итого за период
        </span>
        <span className="text-[11px] font-semibold tabular-nums">
          {formatMinutes(totalMinutes)} · ~{avgPercent}%
        </span>
      </div>
    </div>
  );
}
