import { CalendarClient } from "@/components/CalendarClient";
import { getUnbookedStudents, getUserStudents } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Calendar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const allStudents = await getUserStudents();
  // Архивные ученики недоступны при планировании уроков
  const students = allStudents.filter((s) => s.status !== "ARCHIVED");
  const unbookedStudents = await getUnbookedStudents();

  return (
    <CalendarClient
      initialUnbookedStudents={unbookedStudents}
      students={students}
    />
  );
}
