import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  HOUR_HEIGHT,
  GRID_HEIGHT,
  SLOT_HEIGHT,
} from "@/constants/timetable";
import { cn } from "@/lib/utils";

interface TimeAxisProps {
  compact?: boolean;
}

export function TimeAxis({ compact }: TimeAxisProps) {
  const hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, i) => i + DAY_START_HOUR,
  );

  return (
    <div
      className={cn(
        // sticky left-0: «заморожённая» колонка — не уезжает при горизонтальном скролле
        "sticky left-0 z-10 flex-shrink-0 bg-sidebar border-r border-border/40",
        "text-muted-foreground select-none relative",
        compact ? "w-[52px]" : "w-16",
      )}
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
                "absolute font-black text-foreground",
                compact
                  ? "left-1 text-[10px]"
                  : "left-2 text-[11px]",
                isFirst ? "translate-y-0" : "-translate-y-1/2",
              )}
              style={{ top: `${isFirst ? hourTop + 4 : hourTop}px` }}
            >
              {String(hour).padStart(2, "0")}
              <span className={compact ? "text-[8px]" : "text-[9px]"}>⁰⁰</span>
            </div>

            {/* :30 */}
            <div
              className={cn(
                "absolute -translate-y-1/2 font-semibold text-muted-foreground/75",
                compact ? "right-1 text-[8px]" : "right-2 text-[9px]",
              )}
              style={{ top: `${hourTop + SLOT_HEIGHT * 2}px` }}
            >
              30
            </div>

            {/* :15 и :45 — только на десктопе */}
            {!compact && (
              <>
                <div
                  className="absolute right-2 text-[9px] text-muted-foreground/55 -translate-y-1/2 font-medium"
                  style={{ top: `${hourTop + SLOT_HEIGHT * 1}px` }}
                >
                  15
                </div>
                <div
                  className="absolute right-2 text-[9px] text-muted-foreground/55 -translate-y-1/2 font-medium"
                  style={{ top: `${hourTop + SLOT_HEIGHT * 3}px` }}
                >
                  45
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
