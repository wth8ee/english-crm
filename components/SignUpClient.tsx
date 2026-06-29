"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2, GraduationCap } from "lucide-react";

export function SignUpClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signUp.email(
        {
          email,
          password,
          name,
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => setIsLoading(true),
          onError: (ctx) => {
            setIsLoading(false);
            setError(ctx.error.message || "Ошибка при регистрации");
          },
          onSuccess: () => {
            setIsLoading(false);
            router.push("/dashboard");
            router.refresh();
          },
        },
      );
    } catch (err) {
      setIsLoading(false);
      setError("Что-то пошло не так. Попробуйте еще раз.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-100 border-border/40 shadow-md bg-sidebar">
        <CardHeader className="space-y-1.5 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background mb-2">
            <GraduationCap className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Регистрация
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Создайте аккаунт для управления вашей CRM
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium">
                Имя
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Анастасия"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-sm pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full h-9 text-xs font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать аккаунт"
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-foreground hover:underline underline-offset-4"
              >
                Войти
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
