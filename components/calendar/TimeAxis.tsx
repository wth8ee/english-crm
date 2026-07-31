import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  HOUR_HEIGHT,
  GRID_HEIGHT,
} from "@/constants/timetable";
import { cn } from "@/lib/utils";

export function TimeAxis() {
  const hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, i) => i + DAY_START_HOUR,
  );

  return (
    <div
      className="w-16 flex-shrink-0 bg-sidebar border-r border-border/40 text-[10px] font-bold text-muted-foreground select-none relative"
      style={{ height: `${GRID_HEIGHT}px` }}
    >
      {hours.map((hour) => {
        const hourTop = (hour - DAY_START_HOUR) * HOUR_HEIGHT;
        // Первая метка сидит на верхней кромке сетки: центрирование
        // -translate-y-1/2 обрезало бы её контейнером со скроллом.
        const isFirst = hourTop === 0;

        return (
          <div key={hour} className="absolute left-0 w-full px-2">
            <div
              className={cn(
                "absolute left-2 text-foreground font-black text-xs",
                isFirst ? "translate-y-0" : "-translate-y-1/2",
              )}
              style={{ top: `${isFirst ? hourTop + 4 : hourTop}px` }}
            >
              {String(hour).padStart(2, "0")}⁰⁰
            </div>

            <div
              className="absolute left-3 text-[9px] text-muted-foreground/40 -translate-y-1/2"
              style={{ top: `${hourTop + 30}px` }}
            >
              15
            </div>
            <div
              className="absolute left-3 text-[9px] text-muted-foreground/40 -translate-y-1/2"
              style={{ top: `${hourTop + 60}px` }}
            >
              30
            </div>
            <div
              className="absolute left-3 text-[9px] text-muted-foreground/40 -translate-y-1/2"
              style={{ top: `${hourTop + 90}px` }}
            >
              45
            </div>
          </div>
        );
      })}
    </div>
  );
}
