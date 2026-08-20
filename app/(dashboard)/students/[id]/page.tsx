import { getStudentById, getStudentSnapshots } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { StudentProfileClient } from "@/components/StudentProfileClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentProfile({ params }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const snapshots = await getStudentSnapshots(id);

  return <StudentProfileClient student={student} initialSnapshots={snapshots} />;
}
