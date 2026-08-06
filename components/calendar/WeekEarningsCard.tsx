import { finalLesson } from "@/types/lessons";
import { TrendingUp, Banknote, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekEarningsCardProps {
  dates: string[];
  lessons: finalLesson[];
}

export function WeekEarningsCard({ dates, lessons }: WeekEarningsCardProps) {
  // Only count confirmed/completed lessons as real income
  const paidLessons = lessons.filter(
    (l) => l.status === "confirmed" || l.status === "completed",
  );

  const weekIncome = paidLessons.reduce(
    (sum, l) => sum + l.price * (l.duration / 60),
    0,
  );

  // Projected: add scheduled/rescheduled lessons
  const scheduledLessons = lessons.filter(
    (l) => l.status === "scheduled" || l.status === "rescheduled",
  );
  const projected = scheduledLessons.reduce(
    (sum, l) => sum + l.price * (l.duration / 60),
    0,
  );
  const totalProjected = weekIncome + projected;

  const totalLessons = lessons.filter((l) => l.status !== "cancelled").length;
  const paidCount = paidLessons.length;

  const totalMinutes = paidLessons.reduce((sum, l) => sum + l.duration, 0);
  const hoursWorked = (totalMinutes / 60).toFixed(1);

  const hasPaid = weekIncome > 0;
  const hasProjected = projected > 0;

  return (
    <div className="rounded-2xl border border-border/40 bg-sidebar shadow-sm p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs font-semibold">Доход за период</p>
        <div
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold",
            hasPaid
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-muted text-muted-foreground",
          )}
        >
          <TrendingUp className="h-2.5 w-2.5" />
          {dates.length}{" "}
          {dates.length === 1 ? "день" : dates.length <= 4 ? "дня" : "дней"}
        </div>
      </div>

      {/* Main amount */}
      <div className="px-1 mb-3">
        <div className="text-2xl font-bold tabular-nums leading-none">
          {weekIncome.toLocaleString("ru-RU")} ₽
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Оплаченные уроки за выбранный период
        </p>
      </div>

      {/* Divider */}
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
              <span className="text-[11px] font-semibold tabular-nums text-violet-500">
                {totalProjected.toLocaleString("ru-RU")} ₽
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(Math.round((weekIncome / totalProjected) * 100), 100)}%`,
                }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              {Math.round((weekIncome / totalProjected) * 100)}% уже оплачено
            </p>
          </div>
        </>
      )}

      {/* Empty state */}
      {!hasPaid && !hasProjected && (
        <div className="px-1 text-center py-2">
          <p className="text-[10px] text-muted-foreground">
            Нет уроков за этот период
          </p>
        </div>
      )}
    </div>
  );
}
