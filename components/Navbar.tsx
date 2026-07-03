"use client";

import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LogOut,
  UserPlus,
  GraduationCap,
  Wallet,
  Users,
  Calendar,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "./ui/sheet";

export function Navbar() {
  const { session } = useAuth();
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/students") ||
    pathname.startsWith("/finances");

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  };

  return (
    <nav className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border/40 bg-sidebar px-4 sm:px-6 max-[340px]:px-2">
      {/* ЛЕВАЯ ЧАСТЬ: Бургер и Логотип */}
      <div className="flex items-center gap-2 max-min-[340px]:gap-1 min-w-0">
        {/* Бургер-меню (на мобилках) */}
        <div className="md:hidden shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[240px] bg-sidebar border-r border-border/40 p-4"
            >
              <SheetHeader className="text-left pb-4 border-b border-border/20">
                <SheetTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  English CRM
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1.5 pt-4">
                <Link href="/dashboard">
                  <Button
                    variant={isDashboard ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 text-xs h-9 font-medium rounded-lg"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    Главная
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-xs h-9 font-medium rounded-lg"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Календарь
                  </Button>
                </Link>
                <Link href="/students">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-xs h-9 font-medium rounded-lg"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Ученики
                  </Button>
                </Link>
                <Link href="/finances">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-xs h-9 font-medium rounded-lg"
                  >
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    Финансы
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Текст раздела или логотип */}
        <div className="flex items-center min-w-0">
          {isDashboard ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 md:block hidden truncate">
              Панель управления
            </span>
          ) : null}

          <Link
            href="/dashboard"
            className="flex items-center gap-2 max-[340px]:gap-0 hover:opacity-85 transition-opacity md:hidden min-w-0"
          >
            {/* Иконка-шапочка остаётся ВСЕГДА */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
              <GraduationCap className="h-4 w-4" />
            </div>
            {/* ФИКС: Текст «English CRM» прячется, если экран сужается меньше 340px */}
            <span className="font-semibold text-sm tracking-tight text-foreground truncate max-[340px]:hidden">
              English CRM
            </span>
          </Link>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Кнопки и тема */}
      {/* Сжали gap с 4 до 2 на микро-экранах */}
      <div className="flex items-center gap-4 max-[340px]:gap-1.5 shrink-0">
        {session ? (
          <div className="flex items-center gap-2 max-[340px]:gap-1">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs font-medium leading-none text-foreground">
                {session.user.name}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[150px] truncate">
                {session.user.email}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 gap-2 max-[340px]:gap-0 text-xs font-normal text-muted-foreground hover:text-foreground shrink-0 max-[340px]:w-8 max-[340px]:p-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 max-[340px]:gap-1">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs font-normal max-[340px]:w-8 max-[340px]:p-0"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Войти</span>
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs font-normal max-[340px]:w-8 max-[340px]:p-0"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Регистрация</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Разделитель на 300px убираем, чтобы освободить место */}
        <div className="h-4 w-px bg-border/40 shrink-0 max-[340px]:hidden" />

        <div className="shrink-0 flex items-center">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
