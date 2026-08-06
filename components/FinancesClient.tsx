"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  Hourglass,
  Download,
  Coins,
  Target,
  BarChart3,
  CalendarCheck,
} from "lucide-react";
import { TransactionsTable } from "./TransactionsTable";
import { Lesson } from "@/generated/prisma/client";
import { cn, pluralize, shorten } from "@/lib/utils";
import { getPast6Months } from "@/lib/date";

interface StudentShare {
  name: string;
  income: number;
  percent: number;
}

interface FinancesClientProps {
  lessons: Lesson[];
  confirmedLessons: Lesson[];
  thisMonthLessons: Lesson[];
  avgHourlyRate: number;
  completedLessons: Lesson[];
  studentsShares: StudentShare[];
  lastMonthLessons: Lesson[];
  scheduledThisMonth: Lesson[];
}

export function FinancesClient({
  lessons,
  confirmedLessons,
  thisMonthLessons,
  avgHourlyRate,
  completedLessons,
  studentsShares,
  lastMonthLessons,
  scheduledThisMonth,
}: FinancesClientProps) {
  const totalIncome = confirmedLessons.reduce(
    (acc, lesson) => acc + lesson.price * (lesson.duration / 60),
    0,
  );
  const thisMonthIncome = thisMonthLessons?.length
    ? thisMonthLessons.reduce(
        (acc, lesson) => acc + lesson.price * (lesson.duration / 60),
        0,
      )
    : 0;
  const lessonsWorked = [...confirmedLessons, ...completedLessons];
  const hoursWorked = Number(
    lessonsWorked
      .reduce((acc, lesson) => acc + lesson.duration / 60, 0)
      .toFixed(1),
  );

  // Last month income for comparison
  const lastMonthIncome = lastMonthLessons.reduce(
    (acc, l) => acc + l.price * (l.duration / 60),
    0,
  );
  const monthGrowth =
    lastMonthIncome > 0
      ? Math.round(((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100)
      : null;

  // Projected income = confirmed this month + scheduled this month
  const scheduledIncome = scheduledThisMonth.reduce(
    (acc, l) => acc + l.price * (l.duration / 60),
    0,
  );
  const projectedIncome = thisMonthIncome + scheduledIncome;

  // Conversion rate: confirmed / (confirmed + completed + scheduled + cancelled)
  const totalNonScheduled = confirmedLessons.length + completedLessons.length;
  const totalAllLessons = lessons.length;
  const conversionRate =
    totalAllLessons > 0
      ? Math.round((totalNonScheduled / totalAllLessons) * 100)
      : 0;

  // Last 4 weeks bar chart data
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    // i=0 is oldest (3 weeks ago), i=3 is most recent (this week)
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);

    const pad2 = (n: number) => String(n).padStart(2, "0");
    const startStr = `${weekStart.getFullYear()}-${pad2(weekStart.getMonth() + 1)}-${pad2(weekStart.getDate())}`;
    const endStr = `${weekEnd.getFullYear()}-${pad2(weekEnd.getMonth() + 1)}-${pad2(weekEnd.getDate())}`;

    const weekLessons = confirmedLessons.filter(
      (l) => l.date >= startStr && l.date <= endStr,
    );
    const income = weekLessons.reduce(
      (acc, l) => acc + l.price * (l.duration / 60),
      0,
    );

    // Short label like "28.07"
    const label = `${pad2(weekStart.getDate())}.${pad2(weekStart.getMonth() + 1)}`;

    return { label, income };
  }).reverse(); // oldest first

  const weeklyBgColors = [
    "bg-foreground/25",
    "bg-foreground/45",
    "bg-foreground/70",
    "bg-foreground",
  ];
  const weeklyHoverColors = [
    "group-hover:bg-foreground/15",
    "group-hover:bg-foreground/35",
    "group-hover:bg-foreground/55",
    "group-hover:bg-foreground/85",
  ];
  const maxWeeklyAmount = Math.max(...weeklyData.map((d) => d.income), 1);
  const avgWeeklyIncome = Math.round(
    weeklyData.reduce((s, d) => s + d.income, 0) / 4,
  );

  const chartMonths = getPast6Months();
  const monthlyData = chartMonths.map((m, idx) => {
    const lessonsInMonth = confirmedLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getMonth() === m.monthIndex &&
        lessonDate.getFullYear() === m.year
      );
    });

    const colors = [
      "bg-foreground/20",
      "bg-foreground/30",
      "bg-foreground/40",
      "bg-foreground/60",
      "bg-foreground/75",
      "bg-foreground",
    ];

    const hoverColors = [
      "group-hover:bg-foreground/10",
      "group-hover:bg-foreground/20",
      "group-hover:bg-foreground/30",
      "group-hover:bg-foreground/40",
      "group-hover:bg-foreground/60",
      "group-hover:bg-foreground/75",
    ];

    const totalEarned = lessonsInMonth.reduce((sum, lesson) => {
      const lessonPrice = (lesson.duration / 60) * lesson.price;
      return sum + lessonPrice;
    }, 0);

    return {
      name: m.name,
      amount: totalEarned,
      bgClass: colors[idx],
      hoverClass: hoverColors[idx],
      tooltipText:
        totalEarned > 0 ? `${(totalEarned / 1000).toFixed(1)}к` : "0 ₽",
    };
  });

  const maxAmount = Math.max(...monthlyData.map((d) => d.amount), 1);

  const shareColors = [
    "bg-foreground",
    "bg-foreground/75",
    "bg-foreground/60",
    "bg-foreground/40",
    "bg-foreground/30",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Финансы и Статистика
          </h1>
          <p className="text-xs text-muted-foreground">
            Учет доходов, аналитика заработка и история полученных платежей.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-1.5 text-xs font-medium border-border/40 bg-sidebar shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          Экспорт в Excel
        </Button>
      </div>

      {/* ── Top KPI cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Доход за все время
            </CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {totalIncome.toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-[10px] text-muted-foreground">
              Общий баланс зафиксированных оплат
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Заработок за месяц
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {thisMonthIncome.toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-[10px] text-muted-foreground">
              {monthGrowth !== null ? (
                <span
                  className={cn(
                    "font-medium",
                    monthGrowth >= 0 ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {monthGrowth >= 0 ? "+" : ""}
                  {monthGrowth}%
                </span>
              ) : (
                <span>Первый месяц данных</span>
              )}{" "}
              {monthGrowth !== null && "по сравнению с прошлым"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Средняя стоимость часа
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {Math.floor(avgHourlyRate).toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-[10px] text-muted-foreground">
              Рассчитано на основе всех active ставок
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Отработано за месяц
            </CardTitle>
            <Hourglass className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {pluralize(hoursWorked, "час", "часа", "часов")}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Примерно{" "}
              {pluralize(
                Number(((hoursWorked * 7) / 31).toFixed(1)),
                "час",
                "часа",
                "часов",
              )}{" "}
              в неделю
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── New metrics row ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Projected income */}
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Прогноз месяца
            </CardTitle>
            <Target className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {projectedIncome.toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">
              Оплачено + запланированные уроки
            </p>
            {projectedIncome > 0 && (
              <>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.round((thisMonthIncome / projectedIncome) * 100), 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {Math.round((thisMonthIncome / projectedIncome) * 100)}%
                  уже получено
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Conversion rate */}
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Конверсия оплат
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{conversionRate}%</div>
            <p className="text-[10px] text-muted-foreground mb-3">
              {totalNonScheduled} из {totalAllLessons} уроков завершено
            </p>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Доля проведённых и оплаченных
            </p>
          </CardContent>
        </Card>

        {/* Avg weekly income — bar chart */}
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Среднее в неделю
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {avgWeeklyIncome.toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-[10px] text-muted-foreground mb-4">
              Средний доход за последние 4 недели
            </p>
            {/* 4-week bar chart */}
            <div className="flex items-end justify-between gap-2 h-16 pt-1">
              {weeklyData.map((week, idx) => {
                const heightPct = Math.max(
                  Math.floor((week.income / maxWeeklyAmount) * 100),
                  4,
                );
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1.5 flex-1 group relative"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover border border-border/40 rounded px-1 py-0.5 text-[8px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {week.income > 0
                        ? week.income >= 1000
                          ? `${(week.income / 1000).toFixed(1)}к`
                          : `${Math.round(week.income)} ₽`
                        : "0 ₽"}
                    </div>
                    <div
                      style={{ height: `calc(4rem * ${heightPct} / 100)` }}
                      className={cn(
                        "w-full rounded-t-sm transition-colors",
                        weeklyBgColors[idx],
                        weeklyHoverColors[idx],
                      )}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {week.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/40 bg-sidebar shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Динамика доходов
            </CardTitle>
            <CardDescription className="text-xs">
              Ежемесячный заработок за текущий год
            </CardDescription>
          </CardHeader>
          <CardContent className="h-52 flex items-end justify-between gap-2 pt-4 px-2">
            {monthlyData.map((data, idx) => {
              const heightPercent = Math.max(
                Math.floor((data.amount / maxAmount) * 100),
                4,
              );
              const heightClass = `calc(12rem*${heightPercent}/100)`;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 flex-1 group relative"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover border border-border/40 rounded px-1 py-0.5 text-[8px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(data.amount / 1000).toFixed(1)}к
                  </div>
                  <div
                    style={{ height: heightClass }}
                    className={cn(
                      `w-full rounded-t-sm transition-colors`,
                      data.bgClass,
                      data.hoverClass,
                    )}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {data.name}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/40 bg-sidebar shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Доли по ученикам
            </CardTitle>
            <CardDescription className="text-xs">
              Распределение выручки в процентах
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-3.5">
            {studentsShares.length > 0 ? (
              studentsShares.slice(0, 5).map((studentShare, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{shorten(studentShare.name)}</span>
                    <span className="text-muted-foreground">
                      {studentShare.percent}% (
                      {studentShare.income.toLocaleString("ru-RU")} ₽)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-foreground rounded-full transition-all duration-500",
                        shareColors[idx],
                      )}
                      style={{
                        width: `${studentShare.percent}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-foreground/25 bg-muted/20 my-auto">
                <p className="text-[14px] font-semibold text-foreground">
                  📊 Аналитика пока пуста
                </p>
                <p className="text-[11px] text-foreground/60 mt-1 max-w-52.5 leading-tight">
                  Здесь появится распределение выручки, когда вы отметите первые
                  уроки как оплаченные
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <TransactionsTable /> */}
    </div>
  );
}
