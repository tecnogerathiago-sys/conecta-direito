import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { Card } from "@/components/ui/Card";
import { LEGAL_AREA_LABELS } from "@/lib/constants";

const STEPS = [
  { title: "Conte seu caso", text: "Preencha um formulário rápido com os detalhes da sua situação." },
  { title: "Advogados entram em contato", text: "Até 3 advogados especializados recebem sua demanda e falam com você." },
  { title: "Escolha quem te atender", text: "Compare e converse à vontade antes de decidir com quem seguir." },
];

export default function LandingPage() {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-10 text-center text-2xl font-bold text-primary-900">
          Como funciona
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Card key={step.title}>
              <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-sm font-bold text-accent-600">
                {i + 1}
              </span>
              <h3 className="mb-1 font-semibold text-primary-900">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-6 text-center text-2xl font-bold text-primary-900">
          Áreas de atendimento
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {Object.values(LEGAL_AREA_LABELS).map((label) => (
            <span
              key={label}
              className="rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-medium text-primary-700"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-primary-50 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-primary-900">É advogado?</h2>
          <p className="mb-6 text-slate-600">
            Receba oportunidades de clientes reais na sua área de atuação.
          </p>
          <Link
            href="/advogado/entrar"
            className="font-semibold text-accent-600 underline underline-offset-4"
          >
            Acessar painel do advogado
          </Link>
        </div>
      </section>
    </main>
  );
}
