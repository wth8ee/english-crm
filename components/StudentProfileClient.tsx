"use client";

import { Student, ProgressSnapshot } from "@/generated/prisma/client";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { calculateScores, EGE_TASK_POINTS, OGE_TASK_POINTS, TaskState } from "@/lib/scoring";
import { saveTaskProgress } from "@/lib/actions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";

interface StudentProfileClientProps {
  student: Student;
  initialSnapshots: ProgressSnapshot[];
}

export function StudentProfileClient({ student, initialSnapshots }: StudentProfileClientProps) {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<ProgressSnapshot[]>(initialSnapshots);
  const [isLoading, setIsLoading] = useState(false);

  const numTasks = student.examType === "ЕГЭ" ? EGE_TASK_POINTS.length : OGE_TASK_POINTS.length;

  // Initialize tasks from latest snapshot or empty
  const [tasks, setTasks] = useState<TaskState[]>(() => {
    if (initialSnapshots.length > 0) {
      const latest = initialSnapshots[initialSnapshots.length - 1];
      const parsed = latest.tasksJson as any;
      if (Array.isArray(parsed) && parsed.length === numTasks) {
        return parsed as TaskState[];
      }
    }
    return Array.from({ length: numTasks }, () => ({
      inTheory: false,
      hundredPercent: false
    }));
  });

  const scores = useMemo(() => calculateScores(student.examType, tasks), [tasks, student.examType]);

  const handleTheoryChange = (idx: number, checked: boolean) => {
    setTasks(prev => {
      const newTasks = [...prev];
      newTasks[idx].inTheory = checked;
      if (!checked) {
        newTasks[idx].hundredPercent = false;
      }
      return newTasks;
    });
  };

  const handleHundredChange = (idx: number, checked: boolean) => {
    setTasks(prev => {
      const newTasks = [...prev];
      newTasks[idx].hundredPercent = checked;
      if (checked) {
        newTasks[idx].inTheory = true;
      }
      return newTasks;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    const result = await saveTaskProgress(
      student.id,
      tasks,
      scores.hundredSecondary,
      scores.theorySecondary
    );
    if (result.snapshot) {
      setSnapshots(prev => [...prev, result.snapshot]);
    }
    setIsLoading(false);
  };

  const chartData = useMemo(() => {
    return snapshots.map(s => ({
      date: format(new Date(s.createdAt), "dd MMM HH:mm", { locale: ru }),
      "Реальный": s.realisticScore,
      "Лаки": s.luckyScore
    }));
  }, [snapshots]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="bg-sidebar border-border/40">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-xs text-muted-foreground">Профиль ученика ({student.examType})</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Текущие баллы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2 border-b border-border/40 pb-2">
              <span className="text-xs font-medium text-muted-foreground">Реальный уровень:</span>
              <span className="font-bold text-emerald-500">
                {student.examType === "ЕГЭ" 
                  ? `${scores.hundredSecondary} / 100` 
                  : `${scores.hundredPrimary} (Оценка ${scores.hundredSecondary})`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-medium text-muted-foreground">Лаки (в теории):</span>
              <span className="font-bold text-violet-500">
                {student.examType === "ЕГЭ" 
                  ? `${scores.theorySecondary} / 100` 
                  : `${scores.theoryPrimary} (Оценка ${scores.theorySecondary})`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 bg-sidebar shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Матрица задач</CardTitle>
            <CardDescription className="text-xs">Отмечайте задачи, которые решает ученик</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={isLoading} size="sm" className="h-8 gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Сохранить прогресс
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/40 pb-2">
            <div className="inline-flex min-w-full">
              <div className="flex flex-col border-r border-border/40 sticky left-0 bg-sidebar z-10 w-28 shrink-0">
                <div className="h-8 border-b border-border/40 flex items-center px-2 text-[10px] font-semibold text-muted-foreground">
                  Номер задачи
                </div>
                <div className="h-8 border-b border-border/40 flex items-center px-2 text-[10px] font-medium">
                  В теории
                </div>
                <div className="h-8 flex items-center px-2 text-[10px] font-medium">
                  100% решит
                </div>
              </div>

              {tasks.map((task, idx) => (
                <div key={idx} className="flex flex-col border-r border-border/40 w-10 shrink-0">
                  <div className="h-8 border-b border-border/40 flex items-center justify-center text-xs font-bold bg-muted/20">
                    {idx + 1}
                  </div>
                  <div className="h-8 border-b border-border/40 flex items-center justify-center hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={task.inTheory}
                      onChange={(e) => handleTheoryChange(idx, e.target.checked)}
                      className="h-3.5 w-3.5 accent-violet-500 cursor-pointer"
                    />
                  </div>
                  <div className="h-8 flex items-center justify-center hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={task.hundredPercent}
                      onChange={(e) => handleHundredChange(idx, e.target.checked)}
                      className="h-3.5 w-3.5 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-sidebar shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">График прогресса</CardTitle>
          <CardDescription className="text-xs">Динамика реального и лаки уровня по времени</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--sidebar-background))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} 
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="Лаки" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Реальный" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-border/40 bg-muted/10">
              <p className="text-sm font-medium text-foreground">Нет данных для графика</p>
              <p className="text-xs text-muted-foreground mt-1">Отметьте задачи и сохраните прогресс, чтобы увидеть динамику</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
