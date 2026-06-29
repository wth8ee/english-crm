import { DashboardClient } from "@/components/DashboardClient";
import {
  getConfirmedLessons,
  getThisMonthLessons,
  getThisMonthStudents,
  getTodayLessons,
  getUnbookedStudents,
  getUserStudents,
} from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const confirmedLessons = await getConfirmedLessons();
  const thisMonthLessons = await getThisMonthLessons();
  const students = await getUserStudents();
  const todayLessons = await getTodayLessons();
  const thisMonthStudents = await getThisMonthStudents();
  const unbookedStudents = await getUnbookedStudents();

  return (
    <DashboardClient
      confirmedLessons={confirmedLessons}
      todayLessons={todayLessons}
      students={students}
      thisMonthLessons={thisMonthLessons}
      thisMonthStudents={thisMonthStudents}
      unbookedStudents={unbookedStudents}
    />
  );
}
