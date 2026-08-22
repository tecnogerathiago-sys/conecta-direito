import { z } from "zod";
import { LegalArea, Urgency } from "@prisma/client";

const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
const oabNumberRegex = /^\d{3,8}$/;

export const clientSignupSchema = z.object({
  fullName: z.string().trim().min(5, "Informe seu nome completo."),
  cpf: z.string().regex(cpfRegex, "Informe um CPF válido."),
  birthDate: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Informe uma data de nascimento válida."),
  phone: z.string().regex(phoneRegex, "Informe um telefone válido, com DDD."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

export const lawyerSignupSchema = z.object({
  fullName: z.string().trim().min(5, "Informe seu nome completo."),
  email: z.string().trim().email("Informe um e-mail válido."),
  phone: z.string().regex(phoneRegex, "Informe um telefone válido, com DDD."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  oabNumber: z.string().regex(oabNumberRegex, "Informe apenas os números da sua OAB."),
  oabState: z.string().length(2, "Selecione a UF da sua OAB."),
  areasOfPractice: z
    .array(z.nativeEnum(LegalArea))
    .min(1, "Selecione ao menos uma área de atuação."),
  activeRegion: z.string().trim().min(2, "Informe a cidade/UF onde você atua."),
});

// Dados de contato já vêm da conta do cliente logado — o formulário de
// abertura de caso só pede os detalhes da causa em si.
export const createLeadSchema = z.object({
  legalArea: z.nativeEnum(LegalArea, { errorMap: () => ({ message: "Selecione a área do direito." }) }),
  description: z
    .string()
    .trim()
    .min(20, "Conte com mais detalhes o que aconteceu (mínimo de 20 caracteres).")
    .max(1000, "Descrição muito longa — resuma em até 1000 caracteres."),
  urgency: z.nativeEnum(Urgency, { errorMap: () => ({ message: "Selecione o nível de urgência." }) }),
  city: z.string().trim().min(2, "Informe sua cidade."),
  state: z.string().length(2, "Informe a UF."),
});

export type ClientSignupInput = z.infer<typeof clientSignupSchema>;
export type LawyerSignupInput = z.infer<typeof lawyerSignupSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
