import { ShieldCheck, Filter, Wallet } from "lucide-react";

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Dentro do Código de Ética da OAB",
    text: "Modelo de assinatura + consentimento do cliente, pensado para evitar captação de clientela (Provimento 205/2021 CFOAB) — o cliente sempre decide se libera o contato.",
  },
  {
    icon: Filter,
    title: "Você escolhe as causas",
    text: "Veja causas anônimas filtradas pela sua área de atuação e região. Manifeste interesse só nas que fizerem sentido para você.",
  },
  {
    icon: Wallet,
    title: "Preço fixo, sem surpresa",
    text: "Uma assinatura mensal dá acesso ilimitado ao mural de causas — sem cobrança por lead, sem comissão sobre o que você fechar.",
  },
];

export function LawyerBenefits() {
  return (
    <section className="mx-auto max-w-shell px-4 py-20 sm:px-6">
      <h2 className="mb-12 text-center text-h1 text-foreground">Por que usar o Conecta Direito</h2>

      <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="flex size-12 items-center justify-center rounded-full border border-border bg-surface text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-h3 text-foreground">{title}</h3>
            <p className="mt-1.5 text-small text-foreground-secondary">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
