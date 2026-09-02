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
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
} from "lucide-react";
// import { TransactionsTable } from "./TransactionsTable";
import { Lesson, Student } from "@/generated/prisma/client";
import { cn, pluralize, shorten } from "@/lib/utils";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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
  students: Student[];
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
  students,
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
  // const projectedIncome = thisMonthIncome + scheduledIncome;

  const predictedMonthlyIncome = students
    .filter((s) => s.status === "ACTIVE")
    .reduce((acc, s) => acc + s.hourlyRate * s.lessonsPerWeek * 4, 0);

  // Conversion rate: confirmed / (confirmed + completed + scheduled + cancelled)
  const totalNonScheduled = confirmedLessons.length + completedLessons.length;
  const totalAllLessons = lessons.length;
  const conversionRate =
    totalAllLessons > 0
      ? Math.round((totalNonScheduled / totalAllLessons) * 100)
      : 0;

  // Last 30 days income
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const pad2d = (n: number) => String(n).padStart(2, '0');
  const thirtyDaysAgoStr = `${thirtyDaysAgo.getFullYear()}-${pad2d(thirtyDaysAgo.getMonth()+1)}-${pad2d(thirtyDaysAgo.getDate())}`;

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const sixtyDaysAgoStr = `${sixtyDaysAgo.getFullYear()}-${pad2d(sixtyDaysAgo.getMonth()+1)}-${pad2d(sixtyDaysAgo.getDate())}`;

  const last30Income = confirmedLessons
    .filter(l => l.date >= thirtyDaysAgoStr)
    .reduce((acc, l) => acc + l.price * (l.duration / 60), 0);

  const prev30Income = confirmedLessons
    .filter(l => l.date >= sixtyDaysAgoStr && l.date < thirtyDaysAgoStr)
    .reduce((acc, l) => acc + l.price * (l.duration / 60), 0);

  const last30Growth = prev30Income > 0 ? Math.round(((last30Income - prev30Income) / prev30Income) * 100) : null;

  // Unpaid (completed but not yet paid) income
  const unpaidIncome = completedLessons.reduce((acc, l) => acc + l.price * (l.duration / 60), 0);

  // Daily cumulative chart: from first confirmed lesson to today
  const pad2 = (n: number) => String(n).padStart(2, "0");

  const dailyData = (() => {
    if (confirmedLessons.length === 0) return [];

    // Group income by date string "YYYY-MM-DD"
    const incomeByDay: Record<string, number> = {};
    for (const lesson of confirmedLessons) {
      const earned = lesson.price * (lesson.duration / 60);
      incomeByDay[lesson.date] = (incomeByDay[lesson.date] ?? 0) + earned;
    }

    // Find date range: from earliest lesson date to today
    const sortedDates = Object.keys(incomeByDay).sort();
    const firstDate = new Date(sortedDates[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result: { date: string; label: string; amount: number; total: number }[] = [];
    let cumulative = 0;
    const cursor = new Date(firstDate);

    while (cursor <= today) {
      const key = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(cursor.getDate())}`;
      const amount = incomeByDay[key] ?? 0;
      cumulative += amount;
      const label = `${pad2(cursor.getDate())}.${pad2(cursor.getMonth() + 1)}`;
      result.push({ date: key, label, amount, total: cumulative });
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  })();

  // Adaptive X-axis: show every N-th tick so labels don't overlap
  const totalDays = dailyData.length;
  const tickEvery = totalDays <= 14 ? 1 : totalDays <= 60 ? 7 : totalDays <= 180 ? 14 : 30;

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

      {/* ── Block: Top KPI cards ── */}
      <h2 className="text-sm font-bold mt-8 mb-4 uppercase tracking-wider text-muted-foreground">Общая сводка</h2>
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

      {/* ── Block: Forecast & Conversion ── */}
      <h2 className="text-sm font-bold mt-8 mb-4 uppercase tracking-wider text-muted-foreground">Прогнозы и метрики</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Predicted income */}
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Расчет ЗП за месяц
            </CardTitle>
            <Target className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {predictedMonthlyIncome.toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">
              Примерный прогноз на базе {students.filter(s => s.status === 'ACTIVE').length} активных учеников
            </p>
            {predictedMonthlyIncome > 0 && (
              <>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.round((thisMonthIncome / predictedMonthlyIncome) * 100), 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {Math.round((thisMonthIncome / predictedMonthlyIncome) * 100)}% от ожидаемого дохода получено
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

        {/* Last 30 days income */}
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Доход за 30 дней
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {last30Income.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-[10px] text-muted-foreground">
              {last30Growth !== null ? (
                <span className={cn('font-medium', last30Growth >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                  {last30Growth >= 0 ? '+' : ''}{last30Growth}%
                </span>
              ) : <span>Первые данные</span>}{' '}
              {last30Growth !== null && 'к предыдущим 30 дням'}
            </p>
          </CardContent>
        </Card>

        {/* Unpaid (completed) lessons */}
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Ожидает оплаты
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {unpaidIncome.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-[10px] text-muted-foreground">
              {completedLessons.length} {completedLessons.length === 1 ? 'урок проведён' : completedLessons.length >= 2 && completedLessons.length <= 4 ? 'урока проведено' : 'уроков проведено'}, но не оплачен{completedLessons.length === 1 ? '' : 'о'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Block: Charts ── */}
      <h2 className="text-sm font-bold mt-8 mb-4 uppercase tracking-wider text-muted-foreground">Аналитика</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/40 bg-sidebar shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Динамика роста дохода
            </CardTitle>
            <CardDescription className="text-xs">
              Накопительный доход по дням проведённых оплаченных уроков
            </CardDescription>
          </CardHeader>
          <CardContent className="h-52 pt-4 px-2">
            {dailyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm font-semibold text-foreground">📊 Нет данных</p>
                <p className="text-[11px] text-muted-foreground mt-1">Отметьте первые уроки как оплаченные</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.3 }}
                    dy={8}
                    interval={tickEvery - 1}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.3 }}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}к` : `${val}`}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(128,128,128,0.4)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border/50 text-foreground text-xs p-2 rounded-lg shadow-lg">
                            <p className="font-semibold mb-1">{d.date}</p>
                            <p className="text-emerald-500 font-medium">Суммарно: {d.total.toLocaleString("ru-RU")} ₽</p>
                            {d.amount > 0 && (
                              <p className="text-muted-foreground text-[10px] mt-0.5">За день: {d.amount.toLocaleString("ru-RU")} ₽</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
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
