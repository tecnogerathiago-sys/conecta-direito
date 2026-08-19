# Conecta Direito

Marketplace jurídico (estilo GetNinjas) que conecta clientes a advogados via sistema de moedas.

## Stack

Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL + Tailwind CSS + NextAuth (Credentials).

## Estrutura de pastas

```
conecta-direito/
  prisma/
    schema.prisma        # Users, Leads, LeadUnlocks, Transactions, CoinPackages
    seed.ts               # dados de demonstração (1 advogado + 3 leads + 3 pacotes)
  src/
    app/
      page.tsx             # landing page
      solicitar/           # formulário multi-step do cliente
      obrigado/             # confirmação
      advogado/
        entrar/              # login do advogado
        layout.tsx            # gate de autenticação + header com saldo
        dashboard/             # mural de oportunidades (feed de leads)
        carteira/               # loja de moedas + histórico
      api/
        leads/                   # POST cria lead
        leads/[id]/unlock/        # POST desbloqueia contato (transação atômica)
        coin-packages/[id]/checkout/  # inicia compra (stub de gateway)
        payments/webhook/              # confirma pagamento e credita moedas
        auth/[...nextauth]/              # NextAuth
    components/
      landing/, forms/, dashboard/, ui/, providers/
    lib/
      prisma.ts     # client singleton
      auth.ts       # NextAuthOptions (Credentials + bcrypt)
      pricing.ts    # cálculo de custo em moedas por área/urgência
      masking.ts     # PublicLead (mascarado) vs UnlockedLead (completo)
      validations.ts  # schemas Zod do formulário
      constants.ts     # labels de áreas, urgência, UFs
    types/
      next-auth.d.ts   # augmentação de tipos da sessão
```

## Modelagem do banco (resumo)

- **User** — advogados (e admins), com `coinBalance`, OAB, áreas/regiões de atuação.
- **Lead** — demanda do cliente. Contém dados sensíveis (`fullName`, `cpf`, `phone`, `email`) que **nunca** devem sair da camada de API sem passar por `lib/masking.ts`.
- **LeadUnlock** — registro único por `(leadId, lawyerId)`; é a prova de que o advogado pagou para ver os dados daquele lead. `Lead.maxUnlocks` (padrão 3) limita a concorrência.
- **Transaction** — histórico de moedas: compras (`PURCHASE`), gastos (`UNLOCK_SPEND`), estornos e bônus.
- **CoinPackage** — pacotes vendidos na loja (Starter/Pro/Premium).

### LGPD / privacidade

`toPublicLead()` em `lib/masking.ts` é o único formato que pode trafegar na listagem pública/feed — remove nome, CPF, telefone e e-mail, e trunca a descrição. Os dados completos só existem em `toUnlockedLead()`, chamado depois que a rota `POST /api/leads/[id]/unlock` confirma o desbloqueio dentro de uma transação `Serializable` (evita que mais advogados que `maxUnlocks` consigam desbloquear em condição de corrida).

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e NEXTAUTH_SECRET
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Login de demonstração (advogado): `advogado.demo@conectadireito.com.br` / `senha123`.

## O que ainda é stub / próximos passos

- **Gateway de pagamento**: `POST /api/coin-packages/[id]/checkout` cria a `Transaction` como `PENDING` e devolve uma `paymentUrl` fake. É preciso trocar pelo SDK real (Pix/Mercado Pago/Pagar.me/Stripe) e validar a assinatura em `POST /api/payments/webhook` usando `PAYMENT_PROVIDER_WEBHOOK_SECRET`.
- **Cadastro de advogado com validação de OAB**: hoje só existe login; falta a tela de cadastro (dados pessoais + nº OAB + áreas/regiões) e, idealmente, uma verificação externa do registro na OAB.
- **Painel admin**: aprovar leads, gerenciar `CoinPackage`, moderar advogados.
- **Notificação ao cliente**: hoje o cliente só vê a tela de confirmação; falta o envio de e-mail/WhatsApp quando um advogado desbloqueia o lead.
