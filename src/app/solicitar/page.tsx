import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";

export default async function SolicitarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/cliente/cadastrar?next=/solicitar");
  }
  if (session.user.role !== "CLIENT") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 sm:py-16">
      <LeadCaptureForm />
    </main>
  );
}
