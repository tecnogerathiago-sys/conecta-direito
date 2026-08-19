import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MAX_INTERESTS_PER_LEAD } from "@/lib/constants";

export default function ObrigadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Card className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 className="size-6" aria-hidden />
        </div>
        <h1 className="text-h2 text-foreground">Caso enviado com sucesso</h1>
        <p className="mb-6 mt-2 text-body text-foreground-secondary">
          Seu caso já está visível, de forma anônima, para advogados especializados na área — até{" "}
          {MAX_INTERESTS_PER_LEAD} podem manifestar interesse. Você vai poder ver o perfil de cada
          um e decidir se libera seu contato. A decisão de contratar é sempre sua.
        </p>
        <Link href="/cliente/dashboard">
          <Button variant="primary" fullWidth>
            Acompanhar meus casos
          </Button>
        </Link>
      </Card>
    </main>
  );
}
