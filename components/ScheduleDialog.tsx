"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { createLesson, getStudentById } from "@/lib/actions";
import { format } from "date-fns";
import { finalLesson } from "@/types/lessons";
import { useState } from "react";
import { Slider } from "./ui/slider";

interface ScheduleDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  students: Student[];
  selectedStudentId: string | undefined;
  setSelectedStudentId: (id: string | undefined) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  selectedDate: string | undefined;
  setSelectedDate: (date: string) => void;
  weekDates: string[];
  lessons: finalLesson[];
  setLessons: React.Dispatch<React.SetStateAction<finalLesson[]>>;
  setUnbookedStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export function ScheduleDialog({
  isOpen,
  setIsOpen,
  selectedTime,
  setSelectedTime,
  students,
  setSelectedStudentId,
  selectedStudentId,
  error,
  setError,
  isLoading,
  setIsLoading,
  selectedDate,
  setSelectedDate,
  weekDates,
  lessons,
  setLessons,
  setUnbookedStudents,
}: ScheduleDialogProps) {
  const [duration, setDuration] = useState<number>(60);
  const [comment, setComment] = useState<string>("");
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [trialPrice, setTrialPrice] = useState<string>("0");

  async function handleSave() {
    if (!selectedStudentId || isLoading) return;
    setError(null);
    const result = await createLesson(
      selectedStudentId,
      selectedTime,
      selectedDate || format(new Date(), "yyyy.MM.dd").split(".").join("-"),
      duration,
      {
        comment,
        isTrial,
        price: isTrial ? Number(trialPrice) || 0 : undefined,
      },
    );
    if (selectedDate && weekDates.includes(selectedDate)) {
      setUnbookedStudents((prev) =>
        prev.filter((student) => student.id !== selectedStudentId),
      );
    }
    if (result.error) {
      setError(result.error);
    }
    setIsOpen(false);
    setComment("");
    setIsTrial(false);
    setTrialPrice("0");
    for (const key in weekDates) {
      if (weekDates[key] === result.lesson?.date) {
        const student = await getStudentById(result.lesson.studentId);
        const newLesson: finalLesson = {
          id: result.lesson.id,
          dayIndex: Number(key),
          time: result.lesson.time,
          student: student?.name || "None",
          status: result.lesson.status || "archived",
          level: student?.level || "None",
          duration: result.lesson.duration,
          price: result.lesson.price,
          comment: result.lesson.comment,
          isTrial: result.lesson.isTrial,
        };
        setLessons((prev) => [...prev, newLesson]);
        setSelectedStudentId(undefined);
        break;
      }
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return remMinutes > 0 ? `${hours} ч ${remMinutes} мин` : `${hours} ч`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-100 border-border/40 bg-sidebar">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Запланировать урок
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Выберите ученика, дату и время проведения занятия.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="student-select" className="text-xs font-medium">
              Ученик
            </Label>
            <Select
              onValueChange={(value) => setSelectedStudentId(value)}
              value={selectedStudentId}
              disabled={students.length == 0}
            >
              <SelectTrigger
                id="student-select"
                className={cn(
                  "h-9 text-xs bg-background border-border/40",
                  students.length == 0 && "opacity-60",
                )}
              >
                <SelectValue
                  placeholder={
                    students.length != 0
                      ? "Выбрать ученика"
                      : "Добавьте учеников"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-sidebar border-border/40 text-xs">
                {students &&
                  students?.map((student, idx) => (
                    <SelectItem key={idx} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-date" className="text-xs font-medium">
                Дата
              </Label>
              <Input
                id="lesson-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs bg-background border-border/40"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lesson-time" className="text-xs font-medium">
                Время начала
              </Label>
              <Input
                id="lesson-time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="h-9 text-xs bg-background border-border/40"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Длительность урока</Label>
            <span className="text-xs font-semibold text-violet-500 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md tabular-nums">
              {formatDuration(duration || 60)}
            </span>
          </div>
          <div className="pt-1">
            <Slider
              min={30}
              max={180}
              step={15}
              value={[duration || 60]}
              onValueChange={(vals) => setDuration(vals[0])}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lesson-comment" className="text-xs font-medium">
            Комментарий
          </Label>
          <textarea
            id="lesson-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Например: повторить времена, новый учебник..."
            rows={2}
            className="flex w-full rounded-md border border-border/40 bg-background px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        <div className="space-y-2.5">
          <label
            htmlFor="lesson-trial"
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <input
              id="lesson-trial"
              type="checkbox"
              checked={isTrial}
              onChange={(e) => setIsTrial(e.target.checked)}
              className="h-4 w-4 rounded border-border/60 accent-violet-500 cursor-pointer"
            />
            <span className="text-xs font-medium">Пробный урок</span>
          </label>

          {isTrial && (
            <div className="space-y-1.5">
              <Label htmlFor="lesson-price" className="text-xs font-medium">
                Цена пробного урока, ₽
              </Label>
              <Input
                id="lesson-price"
                type="number"
                min={0}
                step={50}
                value={trialPrice}
                onChange={(e) => setTrialPrice(e.target.value)}
                className="h-9 text-xs bg-background border-border/40"
              />
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-9 text-xs border-border/60 bg-sidebar/50"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            type="submit"
            size="sm"
            className="h-9 text-xs"
          >
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
