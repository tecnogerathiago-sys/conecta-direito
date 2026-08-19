import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientCaseCard } from "@/components/dashboard/ClientCaseCard";
import { Button } from "@/components/ui/Button";

export default async function ClienteDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/cliente/entrar");

  const cases = await prisma.lead.findMany({
    where: { clientId: session.user.id },
    include: { unlocks: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary-900">Meus casos</h1>
          <p className="text-sm text-slate-500">Acompanhe o andamento de tudo que você enviou.</p>
        </div>
        <Link href="/solicitar">
          <Button variant="success">Abrir novo caso</Button>
        </Link>
      </div>

      {cases.length === 0 ? (
        <p className="text-sm text-slate-500">
          Você ainda não abriu nenhum caso.{" "}
          <Link href="/solicitar" className="font-semibold text-accent-600 underline underline-offset-4">
            Comece agora
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <ClientCaseCard
              key={c.id}
              legalArea={c.legalArea}
              urgency={c.urgency}
              status={c.status}
              city={c.city}
              state={c.state}
              createdAt={c.createdAt}
              unlocksCount={c.unlocks.length}
              maxUnlocks={c.maxUnlocks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
