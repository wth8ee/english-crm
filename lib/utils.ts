import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string,
) {
  const rules = new Intl.PluralRules("ru-RU");
  const status = rules.select(count);

  switch (status) {
    case "one":
      return `${count} ${one}`;
    case "few":
      return `${count} ${few}`;
    case "many":
    default:
      return `${count} ${many}`;
  }
}

export function getCurrentWeekDaysStrings() {
  const today = new Date();
  const day = today.getDay();

  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));

  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);

    const dateString = format(nextDay, "yyyy-MM-dd");

    weekDays.push(dateString);
  }

  return weekDays;
}

export function shorten(name: string) {
  return name.split(" ").length > 1
    ? `${name.split(" ")[0]} ${name.split(" ")[1][0]}.`
    : name;
}
