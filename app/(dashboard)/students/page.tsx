import { StudentsClient } from "@/components/StudentsClient";
import { getUserStudents } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Students() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const students = await getUserStudents();

  return <StudentsClient initialStudents={students} />;
}
