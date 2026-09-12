import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TRUST_BADGES = [
  { icon: Check, label: "Grátis para quem busca advogado" },
  { icon: ShieldCheck, label: "Você decide quem recebe seu contato" },
  { icon: MessageCircle, label: "Suporte também por WhatsApp" },
];

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
          Conte o que aconteceu. Advogados especializados na sua região podem manifestar interesse
          no seu caso — você decide para quem libera seu contato.
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
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-caption font-medium text-primary-foreground/90"
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </span>
          ))}
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
