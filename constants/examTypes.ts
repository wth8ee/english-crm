export const EXAM_TYPES = {
  "ОГЭ": {
    label: "ОГЭ",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/10",
  },
  "ЕГЭ": {
    label: "ЕГЭ",
    badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/10",
  },
} as const;

export type ExamTypeKey = keyof typeof EXAM_TYPES;
