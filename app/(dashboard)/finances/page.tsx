import { FinancesClient } from "@/components/FinancesClient";
import {
  getAllLessons,
  getCompletedLessons,
  getConfirmedLessons,
  getLastMonthConfirmedLessons,
  getScheduledThisMonthLessons,
  getStudentsShares,
  getThisMonthLessons,
  getUserStudents,
} from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Finances() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const lessons = await getAllLessons();
  const confirmedLessons = await getConfirmedLessons();
  const thisMonthLessons = await getThisMonthLessons();
  const completedLessons = await getCompletedLessons();
  const students = await getUserStudents();
  const hourlyRatesSum = students.length
    ? students.reduce((acc, student) => acc + student.hourlyRate, 0)
    : 0;
  const avgHourlyRate = students.length ? hourlyRatesSum / students.length : 0;
  const studentsShares = await getStudentsShares();
  const lastMonthLessons = await getLastMonthConfirmedLessons();
  const scheduledThisMonth = await getScheduledThisMonthLessons();

  return (
    <FinancesClient
      studentsShares={studentsShares}
      thisMonthLessons={thisMonthLessons}
      lessons={lessons}
      confirmedLessons={confirmedLessons}
      avgHourlyRate={avgHourlyRate}
      completedLessons={completedLessons}
      lastMonthLessons={lastMonthLessons}
      scheduledThisMonth={scheduledThisMonth}
    />
  );
}
