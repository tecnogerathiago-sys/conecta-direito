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
    <main className="min-h-screen bg-surface-muted px-6 py-16">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <h1 className="text-2xl font-bold text-primary-900">
          Encontre o advogado ideal para o seu caso
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Conte o que aconteceu. É totalmente gratuito.
        </p>
      </div>
      <LeadCaptureForm />
    </main>
  );
}
