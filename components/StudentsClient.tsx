"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { createStudent, deleteStudentById } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Student } from "@/generated/prisma/client";
import { StudentsList } from "./StudentsList";
import { pluralize } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StudentsClientProps {
  initialStudents: Student[];
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("b1");
  const [hourlyRate, setHourlyRate] = useState("1500");

  const [students, setStudents] = useState(initialStudents);

  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const countStudentsByLevel = (level: string) => {
    return students.filter((student) => student.level === level).length;
  };
  const a1a2 = countStudentsByLevel("A1") + countStudentsByLevel("A2");
  const b1b2 = countStudentsByLevel("B1") + countStudentsByLevel("B2");
  const c1c2 = countStudentsByLevel("C1") + countStudentsByLevel("C2");

  const handleSave = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await createStudent(name, email, level, Number(hourlyRate));

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setStudents((prev) =>
        result.student ? [...prev, result.student] : prev,
      );

      setName("");
      setEmail("");
      setLevel("b1");
      setHourlyRate("1500");
      setIsOpen(false);
      router.refresh();
    }
  };

  const deleteStudent = async (studentId: string) => {
    deleteStudentById(studentId);
    const newStudents = students.filter((student) => student.id !== studentId);
    setStudents(newStudents);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">База учеников</h1>
          <p className="text-xs text-muted-foreground">
            Управление профилями студентов и контроль учебного процесса.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium self-start sm:self-center"
            >
              <Plus className="h-4 w-4" />
              Добавить ученика
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25 border-border/40 bg-sidebar">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Новый ученик
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Заполните основные данные для создания карточки студента.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 py-2">
              {error && (
                <div className="rounded-md bg-destructive/10 p-2.5 text-xs font-medium text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Имя и фамилия
                </Label>
                <Input
                  id="name"
                  placeholder="Алексей Иванов"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="h-9 text-xs bg-background border-border/40"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-9 text-xs bg-background border-border/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="level" className="text-xs font-medium">
                    Уровень
                  </Label>
                  <Select
                    value={level}
                    onValueChange={setLevel}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="level"
                      className="h-9 text-xs bg-background border-border/40"
                    >
                      <SelectValue placeholder="Выбрать" />
                    </SelectTrigger>
                    <SelectContent className="bg-sidebar border-border/40 text-xs">
                      <SelectItem value="A1">A1 • Beginner</SelectItem>
                      <SelectItem value="A2">A2 • Pre-Int</SelectItem>
                      <SelectItem value="B1">B1 • Intermediate</SelectItem>
                      <SelectItem value="B2">B2 • Upper-Int</SelectItem>
                      <SelectItem value="C1">C1 • Advanced</SelectItem>
                      <SelectItem value="C2">C2 • Proficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-medium">
                    Цена за час (₽)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="1500"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    disabled={isLoading}
                    className="h-9 text-xs bg-background border-border/40"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="h-9 text-xs border-border/60 bg-sidebar/50"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 text-xs"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Всего студентов
            </p>
            <p className="text-lg font-bold mt-1">
              {pluralize(students.length, "человек", "человека", "человек")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Уровень A1 - A2
            </p>
            <p className="text-lg font-bold mt-1">
              {pluralize(a1a2, "ученик", "ученика", "учеников")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Уровень B1 - B2
            </p>
            <p className="text-lg font-bold mt-1">
              {pluralize(b1b2, "ученик", "ученика", "учеников")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-sidebar shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Уровень C1 - C2
            </p>
            <p className="text-lg font-bold mt-1">
              {pluralize(c1c2, "ученик", "ученика", "учеников")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или почте..."
            className="pl-9 h-9 text-xs bg-sidebar border-border/40"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-border/40 bg-sidebar"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>

      <Card className="border-border/40 bg-sidebar shadow-sm overflow-hidden">
        <StudentsList
          setStudentToDelete={setStudentToDelete}
          setIsDeleteOpen={setIsDeleteOpen}
          students={students}
        />
      </Card>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="sm:max-w-100 border-border/40 bg-sidebar">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Удалить карточку ученика?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Это действие необратимо. Ученик будет полностью удален из базы
              данных, а все связанные с ним уроки и финансовые транзакции будут
              стерты без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel
              onClick={() => setStudentToDelete(null)}
              className="h-9 text-xs border-border/60 bg-sidebar/50"
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!studentToDelete) return;
                setIsLoading(true);

                await deleteStudent(studentToDelete);

                setIsLoading(false);
                setStudentToDelete(null);
                setIsDeleteOpen(false);
              }}
              className="h-9 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Да, удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
