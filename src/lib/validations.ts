import { z } from "zod";
import { LegalArea, Urgency } from "@prisma/client";

const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

export const clientSignupSchema = z.object({
  fullName: z.string().trim().min(5, "Informe seu nome completo"),
  cpf: z.string().regex(cpfRegex, "CPF inválido"),
  birthDate: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Data de nascimento inválida"),
  phone: z.string().regex(phoneRegex, "Telefone/WhatsApp inválido"),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

// Dados de contato já vêm da conta do cliente logado — o formulário de
// abertura de caso só pede os detalhes da causa em si.
export const createLeadSchema = z.object({
  legalArea: z.nativeEnum(LegalArea, { errorMap: () => ({ message: "Selecione a área do direito" }) }),
  description: z.string().trim().min(20, "Descreva sua situação com mais detalhes (mín. 20 caracteres)"),
  urgency: z.nativeEnum(Urgency, { errorMap: () => ({ message: "Selecione a urgência" }) }),
  city: z.string().trim().min(2, "Informe sua cidade"),
  state: z.string().length(2, "Informe a UF"),
});

export type ClientSignupInput = z.infer<typeof clientSignupSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
