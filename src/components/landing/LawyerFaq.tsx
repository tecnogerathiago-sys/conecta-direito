const FAQS = [
  {
    q: "Isso é captação de clientela, proibida pela OAB?",
    a: "Não. Você não paga por causa nem por contato — assina acesso à plataforma. O contato do cliente só é liberado quando ele mesmo aceita, depois de ver seu perfil. A decisão de contratar é sempre do cliente.",
  },
  {
    q: "Pago por cada causa que eu atender?",
    a: "Não. É uma assinatura mensal fixa, sem comissão sobre o que você fechar com o cliente.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem fidelidade e sem multa.",
  },
  {
    q: "Como sei se a causa é da minha área e região?",
    a: "O mural já mostra só causas anônimas filtradas pela sua área de atuação e pelas regiões que você escolheu no cadastro.",
  },
];

export function LawyerFaq() {
  return (
    <section className="mx-auto max-w-shell px-4 py-20 sm:px-6">
      <h2 className="mb-10 text-center text-h1 text-foreground">Perguntas frequentes</h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {FAQS.map(({ q, a }) => (
          <div key={q}>
            <h3 className="text-h3 text-foreground">{q}</h3>
            <p className="mt-1.5 text-small text-foreground-secondary">{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
