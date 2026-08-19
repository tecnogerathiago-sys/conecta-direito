import { Lead } from "@prisma/client";

/**
 * Campos de uma causa que são seguros para expor no mural de
 * oportunidades. Não inclui nome, CPF nem contato do cliente — a causa é
 * identificada apenas por um código anônimo ("Caso #XXXXXX"), nunca pelo
 * nome de quem abriu.
 */
export type PublicLead = Pick<
  Lead,
  "id" | "legalArea" | "urgency" | "city" | "state" | "status" | "createdAt"
> & {
  caseCode: string;
  title: string;
  descriptionPreview: string;
};

/**
 * Contato do cliente, liberado a um advogado específico somente depois que
 * o próprio cliente aceita (InterestManifestation.contactReleasedAt
 * preenchido). Nunca derive isto de uma simples "compra" — ver
 * src/app/api/leads/[id]/interest/respond/route.ts.
 */
export type ReleasedContact = Pick<
  Lead,
  | "id"
  | "fullName"
  | "cpf"
  | "birthDate"
  | "phone"
  | "email"
  | "legalArea"
  | "description"
  | "urgency"
  | "city"
  | "state"
>;

export function caseCodeFor(leadId: string): string {
  return `Caso #${leadId.slice(-6).toUpperCase()}`;
}

/**
 * Remove todos os dados sensíveis (nome completo, CPF, contatos) e reduz a
 * descrição a um preview curto. Esta é a única forma de Lead que pode
 * trafegar por endpoints públicos/listagem — nunca envie o registro
 * completo do Prisma diretamente na API.
 */
export function toPublicLead(lead: Lead): PublicLead {
  return {
    id: lead.id,
    legalArea: lead.legalArea,
    urgency: lead.urgency,
    city: lead.city,
    state: lead.state,
    status: lead.status,
    createdAt: lead.createdAt,
    caseCode: caseCodeFor(lead.id),
    title: truncate(lead.description, 90),
    descriptionPreview: truncate(lead.description, 220),
  };
}

export function toReleasedContact(lead: Lead): ReleasedContact {
  return {
    id: lead.id,
    fullName: lead.fullName,
    cpf: lead.cpf,
    birthDate: lead.birthDate,
    phone: lead.phone,
    email: lead.email,
    legalArea: lead.legalArea,
    description: lead.description,
    urgency: lead.urgency,
    city: lead.city,
    state: lead.state,
  };
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
