import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LawyerCta() {
  return (
    <section className="border-t border-border bg-primary-subtle">
      <div className="mx-auto flex max-w-shell flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
        <h2 className="text-h1 text-foreground">Você é advogado?</h2>
        <p className="max-w-md text-body text-foreground-secondary">
          Receba oportunidades de clientes que precisam exatamente da sua área de atuação.
        </p>
        <Link href="/advogado/entrar">
          <Button variant="primary" size="lg">
            Quero receber oportunidades
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </section>
  );
}
