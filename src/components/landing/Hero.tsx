import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="border-b border-border bg-primary">
      <div className="mx-auto flex max-w-shell flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 sm:py-20">
        <span className="text-caption font-semibold uppercase tracking-widest text-primary-foreground/60">
          Encontre representação jurídica
        </span>
        <h1 className="max-w-2xl text-display text-primary-foreground">
          Encontre o advogado certo para o seu caso.
        </h1>
        <p className="max-w-xl text-body text-primary-foreground/70">
          Conte o que aconteceu e receba contato de advogados especializados na sua região.
        </p>
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/solicitar">
            <Button variant="success" size="lg">
              Encontrar meu advogado
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex h-12 items-center rounded-md px-6 text-body font-medium text-primary-foreground/80 transition-colors duration-150 hover:text-primary-foreground"
          >
            Como funciona
          </a>
        </div>
        <Link
          href="/cliente/entrar"
          className="mt-1 text-small text-primary-foreground/60 underline underline-offset-4 hover:text-primary-foreground/90"
        >
          Já enviei um caso — acompanhar status
        </Link>
      </div>
    </section>
  );
}
