import { LegalArea, Urgency } from "@prisma/client";

export const LEGAL_AREA_LABELS: Record<LegalArea, string> = {
  TRABALHISTA: "Trabalhista",
  FAMILIA: "Família",
  CONSUMIDOR: "Consumidor",
  CIVEL: "Cível",
  CRIMINAL: "Criminal",
  EMPRESARIAL: "Empresarial",
  PREVIDENCIARIO: "Previdenciário",
  TRIBUTARIO: "Tributário",
  OUTROS: "Outros",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  BAIXA: "Posso esperar",
  MEDIA: "Preciso em breve",
  ALTA: "É urgente",
};

// Estados brasileiros para o seletor de região
export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

// Número máximo de advogados que podem manifestar interesse na mesma causa.
// Regra de produto (evitar sobrecarregar o cliente com contatos), não uma
// cota "comprável" — qualquer advogado assinante pode manifestar interesse
// enquanto houver vaga.
export const MAX_INTERESTS_PER_LEAD = 5;

// Desligado até um gateway de pagamento real (Pix/cartão) ser integrado.
// Ver README.md > "O que ainda é stub". Quando integrar, ligue esta flag.
export const PAYMENTS_ENABLED = false;
