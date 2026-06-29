"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

export function TransactionsTable() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Поиск по комментарию или имени..."
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
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border/40">
              <TableHead className="w-32 text-xs font-semibold pl-6">
                Дата
              </TableHead>
              <TableHead className="text-xs font-semibold">Ученик</TableHead>
              <TableHead className="text-xs font-semibold">
                Тип оплаты
              </TableHead>
              <TableHead className="text-xs font-semibold">
                Комментарий
              </TableHead>
              <TableHead className="text-xs font-semibold text-right pr-6">
                Сумма
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-b border-border/40 bg-background/30 hover:bg-background/60 transition-colors">
              <TableCell className="text-xs text-muted-foreground pl-6">
                Вчера, 18:40
              </TableCell>
              <TableCell className="text-xs font-medium">
                Александра К.
              </TableCell>
              <TableCell>
                <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted border border-border/30">
                  Карта
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                Абонемент на 8 занятий вперед
              </TableCell>
              <TableCell className="text-xs font-bold text-green-500 text-right pr-6">
                +12 000 ₽
              </TableCell>
            </TableRow>

            <TableRow className="border-b border-border/40 bg-background/30 hover:bg-background/60 transition-colors">
              <TableCell className="text-xs text-muted-foreground pl-6">
                18 июня, 15:20
              </TableCell>
              <TableCell className="text-xs font-medium">
                Игорь Дмитриев
              </TableCell>
              <TableCell>
                <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted border border-border/30">
                  Наличные
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                Разовая оплата за прошедший урок
              </TableCell>
              <TableCell className="text-xs font-bold text-green-500 text-right pr-6">
                +1 500 ₽
              </TableCell>
            </TableRow>

            <TableRow className="border-b border-border/40 bg-background/30 hover:bg-background/60 transition-colors">
              <TableCell className="text-xs text-muted-foreground pl-6">
                14 июня, 20:05
              </TableCell>
              <TableCell className="text-xs font-medium">Михаил Т.</TableCell>
              <TableCell>
                <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted border border-border/30">
                  Карта
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                Оплата за пакет из 10 занятий
              </TableCell>
              <TableCell className="text-xs font-bold text-green-500 text-right pr-6">
                +12 000 ₽
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
