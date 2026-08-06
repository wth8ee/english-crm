import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  HOUR_HEIGHT,
  GRID_HEIGHT,
  SLOT_HEIGHT,
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
        const isFirst = hourTop === 0;

        return (
          <div key={hour} className="absolute left-0 w-full">
            {/* Час */}
            <div
              className={cn(
                "absolute left-2 text-foreground font-black text-[11px]",
                isFirst ? "translate-y-0" : "-translate-y-1/2",
              )}
              style={{ top: `${isFirst ? hourTop + 4 : hourTop}px` }}
            >
              {String(hour).padStart(2, "0")}⁰⁰
            </div>

            {/* :15 */}
            <div
              className="absolute right-2 text-[9px] text-muted-foreground/55 -translate-y-1/2 font-medium"
              style={{ top: `${hourTop + SLOT_HEIGHT * 1}px` }}
            >
              15
            </div>
            {/* :30 */}
            <div
              className="absolute right-2 text-[9px] text-muted-foreground/75 -translate-y-1/2 font-semibold"
              style={{ top: `${hourTop + SLOT_HEIGHT * 2}px` }}
            >
              30
            </div>
            {/* :45 */}
            <div
              className="absolute right-2 text-[9px] text-muted-foreground/55 -translate-y-1/2 font-medium"
              style={{ top: `${hourTop + SLOT_HEIGHT * 3}px` }}
            >
              45
            </div>
          </div>
        );
      })}
    </div>
  );
}
