"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { formatDate } from "date-fns";
import { getCurrentWeekDaysStrings } from "./utils";

export async function createStudent(
  name: string,
  email: string,
  level: string,
  hourlyRate: number,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Неавторизированный доступ" };
    }

    if (!name.trim()) {
      return { error: "Имя ученика обязательно для заполнения" };
    }

    if (hourlyRate <= 0) {
      return { error: "Стоимость часа должна быть больше нуля" };
    }

    const newStudent = await prisma.student.create({
      data: {
        name: name,
        email: email,
        level: level,
        hourlyRate: hourlyRate,
        status: "ACTIVE",
        userId: session.user.id,
      },
    });

    revalidatePath("/students");
    return { error: null, student: newStudent };
  } catch (err) {
    console.error("Ошибка при создании ученика:", err);
    return { error: "Не удалось сохранить ученика в базу данных" };
  }
}

export async function updateStudent(
  studentId: string,
  name: string,
  email: string,
  level: string,
  hourlyRate: number,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Неавторизированный доступ" };
    }

    if (!name.trim()) {
      return { error: "Имя ученика обязательно для заполнения" };
    }

    if (hourlyRate <= 0) {
      return { error: "Стоимость часа должна быть больше нуля" };
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id: studentId,
        userId: session.user.id,
      },
      data: {
        name: name,
        email: email,
        level: level,
        hourlyRate: hourlyRate,
      },
    });

    revalidatePath("/students");
    return { error: null, student: updatedStudent };
  } catch (err) {
    console.error("Ошибка при обновлении ученика:", err);
    return { error: "Не удалось обновить данные ученика" };
  }
}

export async function updateStudentStatus(
  studentId: string,
  status: "ACTIVE" | "ARCHIVED",
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Неавторизированный доступ" };
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id: studentId,
        userId: session.user.id,
      },
      data: {
        status: status,
      },
    });

    revalidatePath("/students");
    return { error: null, student: updatedStudent };
  } catch (err) {
    console.error("Ошибка при смене статуса ученика:", err);
    return { error: "Не удалось изменить статус ученика" };
  }
}

export async function getUserStudents() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return [];
  }

  const students = prisma.student.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return students;
}

export async function createLesson(
  studentId: string,
  time: string,
  date: string,
  duration: number,
  options?: { comment?: string; isTrial?: boolean; price?: number },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Неавторизированный доступ" };
    }

    if (!studentId.trim()) {
      return { error: "Необходимо выбрать ученика" };
    }

    const student = await getStudentById(studentId);

    if (!student) {
      return { error: "Ученик не найден" };
    }

    const newLesson = await prisma.lesson.create({
      data: {
        userId: session.user.id,
        studentId: studentId,
        date: date,
        time: time,
        status: "scheduled",
        duration: duration,
        price: options?.isTrial
          ? Math.max(0, Math.round(options?.price ?? 0))
          : student.hourlyRate,
        comment: options?.comment?.trim() || null,
        isTrial: options?.isTrial ?? false,
      },
    });

    return { error: null, lesson: newLesson };
  } catch (err) {
    console.error("Ошибка при создании ученика:", err);
    return { error: "Не удалось сохранить урок в базу данных" };
  }
}

export async function getWeekLessons(weekDates: string[]) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      // return { error: "Неавторизированный доступ" };
      return;
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        date: {
          in: weekDates,
        },
        userId: session.user.id,
      },
      include: {
        student: true,
      },
    });

    return lessons;
  } catch (err) {
    console.error("Ошибка при получении списка уроков на неделю:", err);
  }
}

export async function getStudentById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // return { error: "Неавторизированный доступ" };
    return;
  }

  const student = await prisma.student.findUnique({
    where: {
      id: id,
    },
  });

  return student;
}

export async function updateLessonStatus(
  lessonId: string,
  status: "completed" | "scheduled" | "cancelled" | "rescheduled" | "confirmed",
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // return { error: "Неавторизированный доступ" };
    return;
  }

  const updatedLesson = prisma.lesson.update({
    where: {
      id: lessonId,
    },
    data: {
      status: status,
    },
  });

  return updatedLesson;
}

export async function deleteStudentById(studentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // return { error: "Неавторизированный доступ" };
    return;
  }

  await prisma.student.delete({
    where: {
      id: studentId,
    },
  });
}

export async function getAllLessons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // return { error: "Неавторизированный доступ" };
    return [];
  }

  const lessons = await prisma.lesson.findMany({
    where: { userId: session.user.id },
  });

  return lessons;
}

export async function getConfirmedLessons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // return { error: "Неавторизированный доступ" };
    return [];
  }

  const lessons = await prisma.lesson.findMany({
    where: {
      AND: [{ userId: session.user.id }, { status: "confirmed" }],
    },
    // include: {
    //   student: {
    //     select: {
    //       hourlyRate: true,
    //     },
    //   },
    // },
  });

  return lessons;
}

export async function deleteLessonById(lessonId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // return { error: "Неавторизированный доступ" };
    return;
  }

  await prisma.lesson.delete({
    where: {
      id: lessonId,
    },
  });
}

export async function getTodayLessons() {
  const today = formatDate(new Date(), "yyyy.MM.dd").split(".").join("-");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return [];
  }

  const todayLessons = prisma.lesson.findMany({
    where: {
      date: today,
      userId: session.user.id,
    },
    include: {
      student: {
        select: { id: true, name: true, level: true },
      },
    },
  });

  return todayLessons;
}

export async function getThisMonthLessons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const today = formatDate(new Date(), "yyyy.MM.dd").split(".").join("-");

  if (!session || !session.user) {
    return [];
  }

  const thisMonthLessons = prisma.lesson.findMany({
    where: {
      AND: [
        { userId: session.user.id },
        {
          date: {
            startsWith: today.slice(0, 7),
          },
        },
        { status: "confirmed" },
      ],
    },
    // include: {
    //   student: {
    //     select: {
    //       hourlyRate: true,
    //     },
    //   },
    // },
  });

  return thisMonthLessons;
}

export async function getCompletedLessons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // return { error: "Неавторизированный доступ" };
    return [];
  }

  const lessons = await prisma.lesson.findMany({
    where: {
      AND: [{ userId: session.user.id }, { status: "completed" }],
    },
    // include: {
    //   student: {
    //     select: {
    //       hourlyRate: true,
    //     },
    //   },
    // },
  });

  return lessons;
}

export async function getThisMonthStudents() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return [];
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfNextMonth = new Date(startOfMonth);
  startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

  const thisMonthStudents = await prisma.student.findMany({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
  });

  return thisMonthStudents;
}

// export async function createTransaction(amount: number, studentId: string) {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session || !session.user) {
//     return;
//   }

//   await prisma.transaction.create({
//     data: {
//       studentId: studentId,
//       amount: amount,
//       userId: session.user.id,
//     },
//   });
// }

export async function getUnbookedStudents() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return [];
  }

  const weekDays = getCurrentWeekDaysStrings();

  const unbookedStudents = await prisma.student.findMany({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      lessons: {
        none: {
          date: {
            in: weekDays,
          },
        },
      },
    },
  });

  return unbookedStudents;
}

export async function getLastMonthConfirmedLessons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return [];
  }

  const today = new Date();
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);

  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${lastMonthStart.getFullYear()}-${pad(lastMonthStart.getMonth() + 1)}-01`;
  const endStr = `${lastMonthEnd.getFullYear()}-${pad(lastMonthEnd.getMonth() + 1)}-01`;

  const lessons = await prisma.lesson.findMany({
    where: {
      userId: session.user.id,
      status: "confirmed",
      date: {
        gte: startStr,
        lt: endStr,
      },
    },
  });

  return lessons;
}

export async function getScheduledThisMonthLessons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return [];
  }

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthPrefix = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;

  const lessons = await prisma.lesson.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["scheduled", "rescheduled"] },
      date: {
        startsWith: monthPrefix,
      },
    },
  });

  return lessons;
}

export async function getStudentsShares() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return [];
  }

  const students = await getUserStudents();
  let totalIncome = 0;
  const incomeShares = [];
  for (const student of students) {
    const confirmedLessons = await prisma.lesson.findMany({
      where: {
        studentId: student.id,
        userId: session.user.id,
        status: "confirmed",
      },
    });
    const income = confirmedLessons.reduce(
      (acc, lesson) => acc + (lesson.price * lesson.duration) / 60,
      0,
    );
    totalIncome += income;
    incomeShares.push({
      name: student.name,
      income: income,
      percent: 0,
    });
  }
  for (const incomeShare of incomeShares) {
    incomeShare.percent = Math.floor((incomeShare.income * 100) / totalIncome);
  }
  return incomeShares.toSorted((a, b) => b.percent - a.percent);
}
