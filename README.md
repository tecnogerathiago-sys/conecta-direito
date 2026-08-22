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
        subscriptions/checkout/     # inicia assinatura (cartão via plano, ou Pix avulso)
        payments/webhook/            # confirma pagamento (preapproval e Pix) e ativa/renova
        cron/pix-renewals/            # job diário: gera Pix do próximo ciclo, marca PAST_DUE
        auth/[...nextauth]/            # NextAuth
    components/
      landing/, forms/, dashboard/, ui/, shell/, providers/
    lib/
      prisma.ts        # client singleton
      auth.ts          # NextAuthOptions (Credentials + bcrypt)
      mercadopago.ts     # clients PreApproval / PreApprovalPlan / Payment
      subscriptions.ts  # catálogo de planos (Básico/Pro) + ids do Mercado Pago
      masking.ts         # PublicLead (anônimo) vs ReleasedContact (completo)
      services/
        interests.ts       # regra de negócio de manifestar interesse / responder — com testes
        pixBilling.ts        # cria cobrança Pix (Payment + SubscriptionPayment)
        mercadopagoWebhook.ts # valida assinatura HMAC do webhook — com testes
      validations.ts   # schemas Zod do formulário
      constants.ts      # labels de áreas, urgência, UFs
    types/
      next-auth.d.ts   # augmentação de tipos da sessão
```

## Modelagem do banco (resumo)

- **User** — clientes, advogados e admins. Advogado tem OAB, áreas/regiões de atuação e um histórico de `Subscription`.
- **Lead** — causa cadastrada pelo cliente. Contém dados sensíveis (`fullName`, `cpf`, `phone`, `email`) que **nunca** devem sair da camada de API sem passar por `lib/masking.ts`. Identificada publicamente só por um código anônimo (`caseCodeFor()`, ex: "Caso #A1B2C3").
- **InterestManifestation** — registro de um advogado manifestando interesse numa causa. `status` (`PENDING`/`ACCEPTED`/`DECLINED`) e `contactReleasedAt` (nulo até o cliente aceitar) vivem aqui — por advogado, não por causa, já que causas diferentes podem ter respostas diferentes para advogados diferentes. `Lead.maxInterests` (padrão 5) limita quantos advogados podem manifestar interesse na mesma causa.
- **Subscription** — histórico de assinaturas do advogado (`PENDING` → `ACTIVE` → `PAST_DUE`/`CANCELED`), com `paymentMethod` (`CARD`/`PIX`). Acesso ao mural e à ação de manifestar interesse depende de existir uma `Subscription` com `status = ACTIVE`.
- **SubscriptionPayment** — só para `paymentMethod = PIX`: uma cobrança avulsa por ciclo (QR code, código copia-e-cola, vencimento). Cartão não usa essa tabela — a recorrência é automática no próprio Mercado Pago.
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

`PAYMENTS_ENABLED = true` em `lib/constants.ts`. Rodando em **produção** com
credenciais reais (`APP_USR-...`) na Vercel; localmente usa credenciais de
**teste** (`TEST-...`) de propósito, pra nenhum `npm run dev` conseguir gerar
cobrança real por engano.

Dois métodos de pagamento, cada um com um fluxo bem diferente:

### Cartão (recorrente automático)

`POST /api/subscriptions/checkout` com `{ method: "card" }` devolve o
`init_point` de um **PreApprovalPlan** já cadastrado no Mercado Pago (não
cria uma PreApproval avulsa via API — isso exige `card_token_id` e não é o
fluxo hospedado normal; foi a causa de um bug real onde o botão "Confirmar"
da tela do Mercado Pago nunca habilitava). Os ids dos planos
(`MERCADOPAGO_PLAN_ID_BASICO`/`_PRO`) foram criados uma vez via API — um
por plano, um por ambiente (teste/produção têm ids diferentes) — e não
precisam ser recriados. `external_reference` é anexado à URL do plano como
melhor esforço; como isso não é comportamento documentado, o webhook em
`handlePreapprovalNotification` tem um fallback: se a PreApproval que
voltou não tiver `external_reference`, casa pela Subscription `PENDING`
mais recente do advogado com aquele e-mail.

### Pix (sem débito automático)

Pix não tem "recarga automática" como cartão — cada ciclo é uma cobrança
avulsa nova. `POST /api/subscriptions/checkout` com `{ method: "pix" }`
cria um `SubscriptionPayment` e um Payment do tipo Pix via
`lib/services/pixBilling.ts`, devolvendo o QR code (base64) e o código
"copia e cola" — exibidos inline em `PixCheckoutPanel`, sem redirecionar
pra fora do app. `/api/cron/pix-renewals` (agendado diariamente via
`vercel.json`, protegido por `CRON_SECRET`) gera a cobrança do próximo
ciclo com alguns dias de antecedência e marca `PAST_DUE` quem passou do
prazo de tolerância sem pagar.

**Importante**: o webhook (`POST /api/payments/webhook`) só recebe
notificações dos eventos marcados no painel do Mercado Pago em
Webhooks → Configurar notificações. Hoje só **"Planos e assinaturas"**
está marcado (cobre o fluxo de cartão) — pra confirmações de Pix chegarem,
é preciso marcar também **"Pagamentos (legacy)"**, nos dois modos (teste
e produção).

Verificado manualmente contra a API real: criação de assinatura (cartão),
criação de cobrança Pix com QR code real, e validação de assinatura do
webhook (`lib/services/mercadopagoWebhook.ts`, 6 testes usando o segredo
real) — tudo confirmado funcionando. **O que não foi possível verificar em
sandbox**: autorizar uma assinatura de cartão até o fim (a tela hospedada
do Mercado Pago bloqueia navegador automatizado, e a conta usada não é uma
conta de teste dedicada) e um ciclo completo de renovação Pix (precisa de
~30 dias reais ou disparo manual do cron). Antes de confiar 100% no fluxo,
vale um advogado real assinar (cartão e Pix) e confirmar que a assinatura
vira `ACTIVE` sozinha.

## O que ainda é stub / próximos passos

- **Notificação por e-mail/SMS**: hoje `Notification` é só in-app (aparece dentro do painel). O cliente só sabe que um advogado manifestou interesse ao entrar no site — falta plugar um serviço de e-mail/SMS que dispare a partir da criação de cada `Notification`.
- **Verificação externa da OAB**: o cadastro (`/advogado/cadastrar`) coleta nº + UF da OAB e impede duplicidade (`@@unique([oabNumber, oabState])` — únicos por estado, não globalmente), mas não confirma o registro contra a base real da OAB. Hoje é confiança no que o advogado preenche.
- **Painel admin**: aprovar/moderar causas e advogados, gerenciar assinaturas manualmente.
- **Termos de uso / política de privacidade**: a landing tem um aviso curto no rodapé, mas não existe uma página formal de Termos ainda — precisa ser redigida (ou revisada) por advogado especializado antes de operar com usuários reais.
