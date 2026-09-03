import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LawyerLandingHero() {
  return (
    <section className="border-b border-border bg-primary">
      <div className="mx-auto flex max-w-shell flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 sm:py-20">
        <span className="text-caption font-semibold uppercase tracking-widest text-primary-foreground/60">
          Para advogados
        </span>
        <h1 className="max-w-2xl text-display text-primary-foreground">
          Mais causas para atuar, sem pagar por lead.
        </h1>
        <p className="max-w-xl text-body text-primary-foreground/70">
          Assine a plataforma, veja causas anônimas da sua área e região, e manifeste interesse nas
          que fizerem sentido para você. O cliente decide se libera o contato — sem mensalidade
          escondida, sem comissão por caso.
        </p>
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/advogado/cadastrar">
            <Button variant="success" size="lg">
              Criar conta grátis
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
          <a
            href="#planos"
            className="inline-flex h-12 items-center rounded-md px-6 text-body font-medium text-primary-foreground/80 transition-colors duration-150 hover:text-primary-foreground"
          >
            Ver planos e preços
          </a>
        </div>
        <Link
          href="/advogado/entrar"
          className="mt-1 text-small text-primary-foreground/60 underline underline-offset-4 hover:text-primary-foreground/90"
        >
          Já tenho conta — entrar
        </Link>
      </div>
    </section>
  );
}
