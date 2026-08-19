import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { FolderOpen, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientCaseCard } from "@/components/dashboard/ClientCaseCard";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

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
      <PageHeader
        title="Meus casos"
        description="Acompanhe o andamento de tudo que você enviou."
        actions={
          <Link href="/solicitar">
            <Button variant="success" size="sm">
              <Plus className="size-4" aria-hidden />
              Abrir novo caso
            </Button>
          </Link>
        }
      />

      {cases.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Você ainda não abriu nenhum caso"
          description="Conte o que aconteceu e receba contato de advogados especializados."
          action={
            <Link href="/solicitar">
              <Button variant="primary" size="sm">
                Abrir meu primeiro caso
              </Button>
            </Link>
          }
        />
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
