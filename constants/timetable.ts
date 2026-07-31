// Константы минутной сетки календаря (паттерн paradise: абсолютное
// позиционирование, N пикселей на минуту).
export const DAY_START_HOUR = 9;
export const DAY_END_HOUR = 22; // не включительно
export const PX_PER_MINUTE = 2;
export const HOUR_HEIGHT = 60 * PX_PER_MINUTE; // 120px
export const SLOT_MINUTES = 15;
export const SLOT_HEIGHT = SLOT_MINUTES * PX_PER_MINUTE; // 30px
export const GRID_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT; // 1560px
export const WORKDAY_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60; // 780

// Короткие имена дней недели, индекс = Date.getDay()
export const dayNamesShort = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
