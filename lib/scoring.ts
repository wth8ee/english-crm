export const EGE_TASK_POINTS = Array.from({ length: 27 }, (_, i) => (i < 25 ? 1 : 2));
export const EGE_SCALE: Record<number, number> = {
  0: 0,
  1: 7, 2: 14, 3: 20, 4: 27, 5: 34, 6: 40, 7: 43, 8: 46, 9: 48, 10: 51,
  11: 54, 12: 56, 13: 59, 14: 62, 15: 64, 16: 67, 17: 70, 18: 72, 19: 75, 20: 78,
  21: 80, 22: 83, 23: 85, 24: 88, 25: 90, 26: 93, 27: 95, 28: 98, 29: 100
};

export const OGE_TASK_POINTS = [
  ...Array(12).fill(1), // 1-12
  2, // 13
  3, // 14
  2, // 15
  2, // 16
];

export function getOgeGrade(points: number): number {
  if (points <= 4) return 2;
  if (points <= 10) return 3;
  if (points <= 16) return 4;
  return 5;
}

export interface TaskState {
  inTheory: boolean;
  hundredPercent: boolean;
}

export function calculateScores(examType: string, tasks: TaskState[]) {
  let theoryPoints = 0;
  let hundredPoints = 0;

  const pointsArray = examType === "ЕГЭ" ? EGE_TASK_POINTS : OGE_TASK_POINTS;

  tasks.forEach((task, idx) => {
    if (idx >= pointsArray.length) return;
    const pts = pointsArray[idx];
    if (task.hundredPercent) {
      hundredPoints += pts;
      theoryPoints += pts; // hundred percent implies theory
    } else if (task.inTheory) {
      theoryPoints += pts;
    }
  });

  if (examType === "ЕГЭ") {
    return {
      theoryPrimary: theoryPoints,
      hundredPrimary: hundredPoints,
      theorySecondary: EGE_SCALE[theoryPoints] || 0,
      hundredSecondary: EGE_SCALE[hundredPoints] || 0,
    };
  } else {
    return {
      theoryPrimary: theoryPoints,
      hundredPrimary: hundredPoints,
      theorySecondary: getOgeGrade(theoryPoints),
      hundredSecondary: getOgeGrade(hundredPoints),
    };
  }
}
