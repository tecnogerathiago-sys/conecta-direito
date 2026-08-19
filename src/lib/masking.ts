import { Lead } from "@prisma/client";

/**
 * Campos de um lead que são seguros para expor publicamente no feed de
 * oportunidades, antes de qualquer desbloqueio.
 */
export type PublicLead = Pick<
  Lead,
  "id" | "legalArea" | "urgency" | "city" | "state" | "status" | "coinCost" | "createdAt"
> & {
  descriptionPreview: string;
};

/**
 * Campos completos, liberados somente após confirmar um LeadUnlock
 * válido para o advogado solicitante.
 */
export type UnlockedLead = Pick<
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

/**
 * Remove todos os dados sensíveis (nome completo, CPF, contatos) e reduz a
 * descrição a um preview curto. Esta é a única forma de Lead que pode
 * trafegar por endpoints públicos/listagem antes do desbloqueio — nunca
 * envie o registro completo do Prisma diretamente na API.
 */
export function toPublicLead(lead: Lead): PublicLead {
  return {
    id: lead.id,
    legalArea: lead.legalArea,
    urgency: lead.urgency,
    city: lead.city,
    state: lead.state,
    status: lead.status,
    coinCost: lead.coinCost,
    createdAt: lead.createdAt,
    descriptionPreview: truncate(lead.description, 140),
  };
}

export function toUnlockedLead(lead: Lead): UnlockedLead {
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
