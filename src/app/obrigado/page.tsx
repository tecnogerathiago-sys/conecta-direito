import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MAX_UNLOCKS_PER_LEAD } from "@/lib/constants";

export default function ObrigadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-6 py-16">
      <Card className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success text-2xl">
          ✓
        </div>
        <h1 className="mb-2 text-xl font-bold text-primary-900">Recebemos seu pedido!</h1>
        <p className="mb-6 text-sm text-slate-600">
          Em breve, até {MAX_UNLOCKS_PER_LEAD} advogados especializados no seu caso vão
          entrar em contato pelo telefone ou e-mail informado. Fique atento!
        </p>
        <Link
          href="/cliente/dashboard"
          className="font-semibold text-accent-600 underline underline-offset-4"
        >
          Acompanhar meus casos
        </Link>
      </Card>
    </main>
  );
}
