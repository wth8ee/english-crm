"use client";

import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserPlus, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

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
    <nav className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border/40 bg-sidebar px-6">
      <div>
        {isDashboard ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            Панель управления
          </span>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground truncate">
              English CRM
            </span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end sm:flex">
              <span className="text-xs font-medium leading-none">
                {session.user.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {session.user.email}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 gap-2 text-xs font-normal text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs font-normal"
              >
                <LogIn className="h-3.5 w-3.5" />
                Войти
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="h-8 gap-1.5 text-xs font-normal">
                <UserPlus className="h-3.5 w-3.5" />
                Регистрация
              </Button>
            </Link>
          </div>
        )}

        <div className="h-4 w-px bg-border/60" />
        <ModeToggle />
      </div>
    </nav>
  );
}
