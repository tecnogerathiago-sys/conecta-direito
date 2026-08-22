# Conecta Direito

Plataforma que conecta clientes a advogados. O advogado assina um plano
mensal para ter acesso à plataforma e manifestar interesse em causas — não
paga por lead individual. O contato do cliente só é revelado a um advogado
específico depois que o próprio cliente aceita explicitamente.

> Esse modelo (assinatura + consentimento do cliente, em vez de pagar por
> contato) existe para reduzir o risco de enquadramento como captação de
> clientela / mercantilização da advocacia (art. 39+ do Código de Ética da
> OAB, Provimento 205/2021 do CFOAB). **Isto não é parecer jurídico** — antes
> de operar em produção, valide o modelo e os textos da plataforma (termos de
> uso, copy) com um advogado especializado em direito da advocacia.

## Stack

Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL + Tailwind CSS + NextAuth (Credentials) + Vitest.

## Estrutura de pastas

```
conecta-direito/
  prisma/
    schema.prisma        # Users, Leads, InterestManifestations, Subscriptions, Notifications
    seed.ts               # dados de demonstração (1 advogado com assinatura ativa + 3 leads)
  src/
    app/
      page.tsx             # landing page
      solicitar/           # formulário multi-step do cliente
      obrigado/             # confirmação
      advogado/
        entrar/              # login do advogado
        (protected)/
          layout.tsx           # gate de autenticação + header com badge do plano
          dashboard/            # mural de causas (anônimas) + manifestar interesse
          assinatura/            # planos, status da assinatura, histórico
      cliente/
        entrar/, cadastrar/
        (protected)/
          dashboard/            # "Meus casos" + advogados interessados (aceitar/recusar)
      api/
        leads/                   # POST cria lead (causa)
        leads/[id]/interest/      # POST advogado manifesta interesse (exige assinatura ativa)
        interests/[id]/respond/    # POST cliente aceita/recusa liberar contato
        subscriptions/checkout/     # inicia assinatura (stub de gateway)
        payments/webhook/            # confirma pagamento e ativa/renova assinatura
        auth/[...nextauth]/            # NextAuth
    components/
      landing/, forms/, dashboard/, ui/, shell/, providers/
    lib/
      prisma.ts        # client singleton
      auth.ts          # NextAuthOptions (Credentials + bcrypt)
      subscriptions.ts  # catálogo de planos (Básico/Pro)
      masking.ts         # PublicLead (anônimo) vs ReleasedContact (completo)
      services/
        interests.ts       # regra de negócio de manifestar interesse / responder — com testes
      validations.ts   # schemas Zod do formulário
      constants.ts      # labels de áreas, urgência, UFs
    types/
      next-auth.d.ts   # augmentação de tipos da sessão
```

## Modelagem do banco (resumo)

- **User** — clientes, advogados e admins. Advogado tem OAB, áreas/regiões de atuação e um histórico de `Subscription`.
- **Lead** — causa cadastrada pelo cliente. Contém dados sensíveis (`fullName`, `cpf`, `phone`, `email`) que **nunca** devem sair da camada de API sem passar por `lib/masking.ts`. Identificada publicamente só por um código anônimo (`caseCodeFor()`, ex: "Caso #A1B2C3").
- **InterestManifestation** — registro de um advogado manifestando interesse numa causa. `status` (`PENDING`/`ACCEPTED`/`DECLINED`) e `contactReleasedAt` (nulo até o cliente aceitar) vivem aqui — por advogado, não por causa, já que causas diferentes podem ter respostas diferentes para advogados diferentes. `Lead.maxInterests` (padrão 5) limita quantos advogados podem manifestar interesse na mesma causa.
- **Subscription** — histórico de assinaturas do advogado (`PENDING` → `ACTIVE` → `PAST_DUE`/`CANCELED`). Acesso ao mural e à ação de manifestar interesse depende de existir uma `Subscription` com `status = ACTIVE`.
- **Notification** — eventos in-app (interesse manifestado, contato aceito/recusado). Sem envio de e-mail/SMS ainda — ver "o que falta" abaixo.

### LGPD / privacidade

`toPublicLead()` em `lib/masking.ts` é o único formato que pode trafegar na listagem pública/feed — remove nome, CPF, telefone e e-mail, reduz a causa a um código anônimo + resumo. Os dados completos só existem via `toReleasedContact()`, chamado quando a `InterestManifestation` do advogado tem `contactReleasedAt` preenchido — o que só acontece através de `POST /api/interests/[id]/respond` quando o **cliente** aceita, nunca automaticamente e nunca por pagamento do advogado.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e NEXTAUTH_SECRET
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
npm test                # roda a suíte Vitest (lib/services/interests.test.ts)
```

Login de demonstração (advogado, já com assinatura ativa): `advogado.demo@conectadireito.com.br` / `senha123`.

## Pagamentos (Mercado Pago)

`PAYMENTS_ENABLED = true` em `lib/constants.ts`, integrado de verdade com o
Mercado Pago (PreApproval / assinaturas recorrentes) — ver
`lib/mercadopago.ts`, `POST /api/subscriptions/checkout` e
`POST /api/payments/webhook`. Hoje as credenciais em uso (env vars
`MERCADOPAGO_ACCESS_TOKEN`/`MERCADOPAGO_PUBLIC_KEY`/`MERCADOPAGO_WEBHOOK_SECRET`)
são **de teste** (prefixo `TEST-`), então nenhuma cobrança real acontece.

Verificado manualmente contra a API real do Mercado Pago: o token autentica,
a criação da assinatura (`POST /api/subscriptions/checkout`) cria um
PreApproval de verdade e devolve uma `init_point` válida, e a validação de
assinatura do webhook (`lib/services/mercadopagoWebhook.ts`) está coberta
por testes usando o segredo real.

**O que não deu pra verificar em sandbox**: autorizar uma assinatura de
teste até o fim (tela de checkout → `status: authorized` → webhook →
`Subscription.status = ACTIVE`). A conta usada para gerar as credenciais é
uma conta Mercado Pago real (não uma conta de teste dedicada), e nesse
cenário: (a) a tela de checkout deles bloqueia navegador automatizado
(Playwright), e (b) tentar autorizar via API com um cartão de teste retorna
`404 Card token service not found` — a autorização parece só ser possível
pela tela hospedada deles, mesmo por API. Pra fechar esse ciclo em sandbox
seria preciso criar uma aplicação + webhook dedicados para uma conta de
teste (`/users/test_user`), o que não foi feito. **Antes de cobrar
advogados de verdade**, troque as 3 variáveis pelas credenciais de
produção e faça uma assinatura real ponta a ponta pra confirmar que o
webhook ativa a assinatura corretamente.

## O que ainda é stub / próximos passos

- **Notificação por e-mail/SMS**: hoje `Notification` é só in-app (aparece dentro do painel). O cliente só sabe que um advogado manifestou interesse ao entrar no site — falta plugar um serviço de e-mail/SMS que dispare a partir da criação de cada `Notification`.
- **Verificação externa da OAB**: o cadastro (`/advogado/cadastrar`) coleta nº + UF da OAB e impede duplicidade (`@@unique([oabNumber, oabState])` — únicos por estado, não globalmente), mas não confirma o registro contra a base real da OAB. Hoje é confiança no que o advogado preenche.
- **Painel admin**: aprovar/moderar causas e advogados, gerenciar assinaturas manualmente.
- **Termos de uso / política de privacidade**: a landing tem um aviso curto no rodapé, mas não existe uma página formal de Termos ainda — precisa ser redigida (ou revisada) por advogado especializado antes de operar com usuários reais.
