import { Student } from "@/generated/prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { MoreHorizontal, Trash2, Pencil, Archive, ArchiveRestore, User } from "lucide-react";
import Link from "next/link";
import { EXAM_TYPES, ExamTypeKey } from "@/constants/examTypes";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface StudentsListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onToggleStatus: (student: Student) => void;
  setStudentToDelete: (id: string) => void;
  setIsDeleteOpen: (isDeleteOpen: boolean) => void;
}

export function StudentsList({
  students,
  onEdit,
  onToggleStatus,
  setStudentToDelete,
  setIsDeleteOpen,
}: StudentsListProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/40">
        <TableRow className="border-b border-border/40">
          <TableHead className="w-56 text-xs font-semibold pl-6">
            Имя ученика
          </TableHead>
          <TableHead className="text-xs font-semibold">Экзамен</TableHead>
          <TableHead className="text-xs font-semibold">Контакты</TableHead>
          <TableHead className="text-xs font-semibold">
            Стоимость часа
          </TableHead>
          <TableHead className="text-xs font-semibold">Статус</TableHead>
          <TableHead className="w-12.5"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 && (
          <TableRow className="border-b border-border/40 bg-background/30">
            <TableCell
              colSpan={6}
              className="py-10 text-center text-xs text-muted-foreground"
            >
              В этой вкладке пока нет учеников
            </TableCell>
          </TableRow>
        )}
        {students.map((student) => {
          const typeKey = student.examType as ExamTypeKey;
          const typeData = EXAM_TYPES[typeKey] || { label: student.examType, badgeClass: "" };

          return (
            <TableRow
              key={student.id}
              className={cn(
                "border-b border-border/40 bg-background/30 hover:bg-background/60 transition-colors",
                student.status === "ARCHIVED" && "opacity-60",
              )}
            >
              <TableCell className="font-medium text-xs pl-6">
                {student.name}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    typeData.badgeClass,
                    "text-[10px] px-2 py-0.5 rounded font-medium border",
                  )}
                >
                  {typeData.label}
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {student.email}
              </TableCell>
              <TableCell className="text-xs font-medium">
                {student.hourlyRate} ₽
              </TableCell>
              <TableCell>
                {student.status === "ACTIVE" ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
                    Активен
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground/60 font-medium border border-border/20">
                    Архив
                  </span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={4}
                    className="bg-sidebar/95 backdrop-blur-md border border-border/50 text-xs min-w-37.5 p-1 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] animate-in fade-in-50 zoom-in-95"
                  >
                    <DropdownMenuItem
                      onClick={() => onEdit(student)}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 select-none outline-none transition-colors focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                    >
                      <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-medium tracking-tight text-nowrap">
                        Редактировать
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/students/${student.id}`}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 select-none outline-none transition-colors focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                      >
                        <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-medium tracking-tight text-nowrap">
                          Профиль
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onToggleStatus(student)}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-foreground/90 select-none outline-none transition-colors focus:bg-muted/80 focus:text-foreground data-highlighted:bg-muted/80"
                    >
                      {student.status === "ARCHIVED" ? (
                        <ArchiveRestore className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <Archive className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="font-medium tracking-tight text-nowrap">
                        {student.status === "ARCHIVED"
                          ? "Вернуть из архива"
                          : "В архив"}
                      </span>
                    </DropdownMenuItem>

                    <div className="h-px bg-border/40 my-1 mx-1" />

                    <DropdownMenuItem
                      onClick={() => {
                        setStudentToDelete(student.id);
                        setIsDeleteOpen(true);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-destructive/80 select-none outline-none transition-colors focus:bg-muted/80 focus:text-destructive data-highlighted:bg-muted/80 data-highlighted:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0 text-destructive/70 group-focus:text-destructive" />

                      <span className="font-medium tracking-tight text-nowrap">
                        Удалить ученика
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
