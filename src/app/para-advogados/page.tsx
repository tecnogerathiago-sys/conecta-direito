import type { Metadata } from "next";
import { LawyerLandingHero } from "@/components/landing/LawyerLandingHero";
import { LawyerBenefits } from "@/components/landing/LawyerBenefits";
import { LawyerPricingPreview } from "@/components/landing/LawyerPricingPreview";
import { LawyerFaq } from "@/components/landing/LawyerFaq";
import { SupportContact } from "@/components/landing/SupportContact";

export const metadata: Metadata = {
  title: "Conecta Direito para Advogados | Mais causas, sem pagar por lead",
  description:
    "Assine o Conecta Direito e veja causas anônimas da sua área e região. Sem comissão por caso, dentro do Código de Ética da OAB.",
};

export default function ParaAdvogadosPage() {
  return (
    <main>
      <LawyerLandingHero />
      <LawyerBenefits />
      <LawyerPricingPreview />
      <LawyerFaq />
      <SupportContact />

      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <p className="mx-auto max-w-shell text-center text-caption text-foreground-muted">
          O Conecta Direito é um canal de divulgação de informações e viabilização de contato entre
          clientes e advogados. A plataforma não presta serviços jurídicos nem realiza captação de
          clientela — a decisão de contratar um advogado é sempre do cliente.
        </p>
      </footer>
    </main>
  );
}
