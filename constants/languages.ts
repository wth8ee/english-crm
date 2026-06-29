export const LANGUAGE_LEVELS = {
  A1: {
    label: "A1 • Beginner",
    badgeClass: "bg-muted text-muted-foreground border-amber/40",
  },
  A2: {
    label: "A2 • Pre-Int",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/10",
  },
  B1: {
    label: "B1 • Intermediate",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/10",
  },
  B2: {
    label: "B2 • Upper-Int",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/10",
  },
  C1: {
    label: "C1 • Advanced",
    badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/10",
  },
  C2: {
    label: "C2 • Proficiency",
    badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/10",
  },
} as const;

export type LanguageLevelKey = keyof typeof LANGUAGE_LEVELS;
