"use client";

import {
  DAY_START_HOUR,
  PX_PER_MINUTE,
  GRID_HEIGHT,
} from "@/constants/timetable";
import { cn, shorten } from "@/lib/utils";
import { finalLesson } from "@/types/lessons";
import {
  CheckCircle2,
  Clock,
  XCircle,
  BadgeCheck,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type LessonStatus =
  | "completed"
  | "scheduled"
  | "cancelled"
  | "rescheduled"
  | "confirmed";

interface LessonCardProps {
  lesson: finalLesson;
  onChangeStatus: (lessonId: string, status: LessonStatus) => void;
  onDelete: (lessonId: string) => void;
}

// Радужная палитра карточек (как в paradise) — цвет детерминирован от id урока,
// статус отображается в шапке карточки.
const colors = [
  "bg-[#f3e8ff] border-[#d8b4fe] dark:bg-[#1e1028] dark:border-[#a855f7]",
  "bg-[#e0e7ff] border-[#a5b4fc] dark:bg-[#0f1628] dark:border-[#6366f1]",
  "bg-[#fef3c7] border-[#fcd34d] dark:bg-[#1c1500] dark:border-[#eab308]",
  "bg-[#ffe4e6] border-[#fecdd3] dark:bg-[#1f0a0d] dark:border-[#f43f5e]",
  "bg-[#e0f2fe] border-[#7dd3fc] dark:bg-[#071620] dark:border-[#38bdf8]",
  "bg-[#ffedd5] border-[#fdba74] dark:bg-[#1c0e00] dark:border-[#f97316]",
  "bg-[#fae8ff] border-[#f5d0fe] dark:bg-[#1a0a1e] dark:border-[#d946ef]",
];

const lessonColorIndex = (lessonId: string) => {
  const hash = lessonId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return hash % colors.length;
};

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours} ч ${rem} мин` : `${hours} ч`;
}

export function LessonCard({
  lesson,
  onChangeStatus,
  onDelete,
}: LessonCardProps) {
  const [h, m] = lesson.time.split(":").map(Number);
  const startMinutes = h * 60 + m - DAY_START_HOUR * 60;
  const top = Math.max(startMinutes, 0) * PX_PER_MINUTE;
  const height = Math.min(lesson.duration * PX_PER_MINUTE, GRID_HEIGHT - top);

  const pad = (n: number) => String(n).padStart(2, "0");
  const endTotal = h * 60 + m + lesson.duration;
  const formattedTime = `${lesson.time} — ${pad(Math.floor(endTotal / 60))}:${pad(endTotal % 60)}`;

  const is15Min = lesson.duration <= 20;
  const is30Min = lesson.duration > 20 && lesson.duration <= 35;
  const is45Min = lesson.duration > 35 && lesson.duration <= 50;

  const isCancelled = lesson.status === "cancelled";
  const isCompleted = lesson.status === "completed";
  const isConfirmed = lesson.status === "confirmed";

  // Левая часть шапки: иконка/подпись статуса или время
  const headerLeft = isCancelled ? (
    <span className="flex items-center gap-1 shrink-0">
      <XCircle
        className="h-3 w-3 text-red-400 shrink-0"
        style={{ filter: "drop-shadow(0 0 4px rgb(239 68 68 / 0.9))" }}
      />
      {!is15Min && (
        <span className="text-red-400 font-bold text-[10px] tracking-wide">
          Отменён
        </span>
      )}
    </span>
  ) : isCompleted ? (
    <span className="flex items-center gap-1 shrink-0">
      <CheckCircle2
        className="h-3 w-3 text-emerald-400 shrink-0"
        style={{ filter: "drop-shadow(0 0 4px rgb(52 211 153 / 0.9))" }}
      />
      {!is15Min && (
        <span className="text-emerald-400 font-bold text-[10px] tracking-wide">
          Завершён
        </span>
      )}
    </span>
  ) : isConfirmed ? (
    <span className="flex items-center gap-1 shrink-0">
      <BadgeCheck
        className="h-3 w-3 text-emerald-400 shrink-0"
        style={{ filter: "drop-shadow(0 0 4px rgb(52 211 153 / 0.9))" }}
      />
      {!is15Min && (
        <span className="text-emerald-400 font-bold text-[10px] tracking-wide">
          Оплачен
        </span>
      )}
    </span>
  ) : (
    <span className="flex items-center gap-1 font-mono shrink-0">
      {lesson.status === "scheduled" && (
        <Clock className="h-3 w-3 mr-0.5 opacity-80" />
      )}
      {is15Min ? lesson.time : formattedTime}
    </span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "absolute left-1 right-1 rounded-xl flex flex-col overflow-hidden select-none group transition-all cursor-pointer border z-20",
            colors[lessonColorIndex(lesson.id)],
            isCancelled
              ? "opacity-70"
              : "shadow-sm hover:scale-[1.001] hover:shadow-md",
          )}
          style={{ top: `${top}px`, height: `${height}px` }}
        >
          {/* ─── ШАПКА ─── */}
          <div className="flex justify-between items-center px-2.5 py-1 text-[10px] font-bold tracking-tight shrink-0 h-6 select-none border-b border-black/5 bg-slate-700 dark:bg-zinc-900/80 text-slate-50 dark:text-zinc-200">
            <div className="flex items-center justify-between flex-1 min-w-0">
              {headerLeft}

              {/* Правая часть шапки */}
              {is15Min ? (
                <div className="flex items-center flex-1 min-w-0 pl-2 ml-2 border-l border-white/20 text-[10px]">
                  <span className="font-extrabold truncate text-white dark:text-zinc-100">
                    {shorten(lesson.student)}
                  </span>
                </div>
              ) : lesson.isTrial ? (
                <span className="flex items-center gap-1 shrink-0 bg-violet-700/40 px-1.5 py-0.5 rounded text-[9px] font-bold text-violet-200 tracking-wide">
                  <Sparkles className="h-2.5 w-2.5" />
                  Пробный
                </span>
              ) : isCancelled || isCompleted || isConfirmed ? (
                <span className="font-mono text-[10px] text-slate-300 dark:text-zinc-400 shrink-0">
                  {formattedTime}
                </span>
              ) : null}
            </div>
          </div>

          {/* ─── ТЕЛО ─── */}
          {!is15Min && (
            <div className="p-2 flex-1 flex flex-col justify-between min-h-0 space-y-0.5 text-black dark:text-zinc-200">
              <div className="min-w-0">
                {is30Min || is45Min ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-extrabold text-xs truncate leading-none pt-0.5">
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
                ) : (
                  <>
                    <p
                      className={cn(
                        "font-extrabold text-xs truncate tracking-tight",
                        isCancelled && "line-through",
                      )}
                    >
                      {lesson.student}
                    </p>
                    <p className="text-[10px] font-bold leading-tight line-clamp-1 mt-0.5 text-black/70 dark:text-zinc-400">
                      {lesson.level} · {formatDuration(lesson.duration)}
                    </p>
                    {lesson.comment && (
                      <div className="flex items-start gap-1 mt-1.5 text-[10px] font-bold leading-tight text-black/80 dark:text-zinc-400">
                        <MessageSquare className="h-3 w-3 mt-0.5 shrink-0 opacity-60" />
                        <p className="line-clamp-2 break-all flex-1">
                          {lesson.comment}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!is30Min && !is45Min && (
                <div className="mt-auto shrink-0 pt-1 border-t border-black/10 dark:border-zinc-700/40">
                  <p className="text-[10px] font-mono font-black tracking-tight leading-none text-black/70 dark:text-zinc-500">
                    {(lesson.price * lesson.duration) / 60} ₽
                  </p>
                </div>
              )}
            </div>
          )}
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
                onClick={() => onChangeStatus(lesson.id, "completed")}
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
                <span className="font-medium tracking-tight">Перенести</span>
              </DropdownMenuItem>

              <div className="h-px bg-border/40 my-1.5 mx-1" />

              <DropdownMenuItem
                onClick={() => onDelete(lesson.id)}
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
              onClick={() => onChangeStatus(lesson.id, "confirmed")}
              className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="font-medium tracking-tight">
                Отметить как оплачен
              </span>
            </DropdownMenuItem>

            <div className="h-px bg-border/40 my-1.5 mx-1" />

            <DropdownMenuItem
              onClick={() => onChangeStatus(lesson.id, "scheduled")}
              className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
            >
              <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
              <span className="font-medium tracking-tight">
                Вернуть в ожидание
              </span>
            </DropdownMenuItem>
          </>
        )}

        {(lesson.status === "confirmed" || lesson.status === "cancelled") && (
          <>
            <DropdownMenuItem
              onClick={() => onChangeStatus(lesson.id, "completed")}
              className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
            >
              <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
              <span className="font-medium tracking-tight">
                Отметить как не оплачен
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onChangeStatus(lesson.id, "scheduled")}
              className="flex items-center gap-3 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 transition-colors select-none outline-none focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
            >
              <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0 translate-y-[0.5px] shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
              <span className="font-medium tracking-tight">
                Вернуть в ожидание
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
