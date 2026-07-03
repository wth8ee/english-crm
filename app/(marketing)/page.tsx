"use client";

import React from "react";

import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function MarketingPage() {
  const { session } = useAuth();

  return (
    <div className="w-full min-h-screen overflow-x-hidden overflow-y-auto bg-background px-4 sm:px-6 py-8 md:py-24 space-y-12 md:space-y-20">
      <section className="text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/40 bg-sidebar text-[11px] font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
          Персональное рабочее пространство преподавателя
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Управляйте своими уроками английского в одном месте
        </h1>

        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Простая и строгая CRM-система для независимых репетиторов. Расписание,
          база учеников и учет доходов без лишнего функционала и хаоса.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="h-11 px-6 text-xs gap-2">
                Открыть панель управления
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button size="lg" className="h-11 px-6 text-xs gap-2">
                  Начать работу
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-6 text-xs border-border/60 bg-sidebar/50"
                >
                  Создать аккаунт
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6">
        <div className="p-6 rounded-2xl border border-border/40 bg-sidebar space-y-3 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_-3px_rgba(0,0,0,0.2)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Calendar className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">Умное расписание</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Визуальная сетка занятий на день, неделю или месяц. Быстрое
            планирование и отметка проведенных уроков в один клик.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/40 bg-sidebar space-y-3 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_-3px_rgba(0,0,0,0.2)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Users className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">Карточки учеников</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Полная база данных студентов. Храните контактные данные, текущий
            уровень английского языка и историю посещений.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/40 bg-sidebar space-y-3 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_-3px_rgba(0,0,0,0.2)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">Контроль доходов</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Фиксация полученных оплат в ручном режиме. Простая наглядная
            статистика заработка за текущий месяц и год.
          </p>
        </div>
      </section>

      <section className="border-t border-border/40 pt-10 text-center">
        <p className="text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} CRM.English. Разработано специально
          для преподавателей иностранных языков.
        </p>
      </section>
    </div>
  );
}
