const STEPS = [
  { number: "01", title: "Conte seu caso", text: "Explique rapidamente sua situação, de forma anônima." },
  { number: "02", title: "Receba manifestações de interesse", text: "Advogados especializados na área analisam seu caso." },
  { number: "03", title: "Decida quem contatar", text: "Veja o perfil de cada interessado e libere seu contato só para quem escolher." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="mx-auto max-w-shell px-4 py-20 sm:px-6">
      <h2 className="mb-12 text-center text-h1 text-foreground">Como funciona</h2>

      <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
        {/* Linha de conexão — apenas desktop */}
        <div
          className="absolute left-0 right-0 top-6 hidden h-px bg-border sm:block"
          style={{ marginInline: "16.66%" }}
          aria-hidden
        />

        {STEPS.map((step) => (
          <div key={step.number} className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="relative z-10 flex size-12 items-center justify-center rounded-full border border-border bg-surface text-body font-semibold text-primary">
              {step.number}
            </span>
            <h3 className="mt-4 text-h3 text-foreground">{step.title}</h3>
            <p className="mt-1.5 text-small text-foreground-secondary">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
