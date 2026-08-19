import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="bg-primary">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
        <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-accent-500">
          Gratuito para quem precisa de ajuda jurídica
        </span>
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
          Encontre o advogado ideal para o seu caso
        </h1>
        <p className="max-w-2xl text-lg text-primary-100">
          Conte o que aconteceu e receba contato de advogados especializados na
          sua região. Rápido, gratuito e sem compromisso.
        </p>
        <Link href="/solicitar">
          <Button variant="success" className="px-8 py-3.5 text-base">
            Encontrar meu advogado agora
          </Button>
        </Link>
      </div>
    </section>
  );
}
