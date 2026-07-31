export function getWeekDates(dateInput: string | Date = new Date()) {
  const currentDate =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const currentDay = currentDate.getDay();
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + distanceToMonday);

  const weekDates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);

    const yyyy = nextDay.getFullYear();
    const mm = String(nextDay.getMonth() + 1).padStart(2, "0");
    const dd = String(nextDay.getDate()).padStart(2, "0");

    weekDates.push(`${yyyy}-${mm}-${dd}`);
  }

  return weekDates;
}

/**
 * Видимые дни календаря: всегда 5 дат — два дня до dateInput,
 * сама дата по центру и два дня после.
 */
export function getVisibleDates(dateInput: string | Date = new Date()) {
  const centerDate =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const dates: string[] = [];
  for (let i = -2; i <= 2; i++) {
    const nextDay = new Date(centerDate);
    nextDay.setDate(centerDate.getDate() + i);

    const yyyy = nextDay.getFullYear();
    const mm = String(nextDay.getMonth() + 1).padStart(2, "0");
    const dd = String(nextDay.getDate()).padStart(2, "0");

    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  return dates;
}

export const getPast6Months = () => {
  const monthsNames = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];
  const result = [];
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    result.push({
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      name: monthsNames[d.getMonth()],
    });
  }
  return result;
};
