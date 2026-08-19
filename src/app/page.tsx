import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LawyerCta } from "@/components/landing/LawyerCta";
import { WrongAccountBanner } from "@/components/landing/WrongAccountBanner";
import { LEGAL_AREA_LABELS } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main>
      <WrongAccountBanner />
      <Hero />
      <HowItWorks />

      <section className="border-t border-border bg-background-secondary">
        <div className="mx-auto max-w-shell px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-h1 text-foreground">Áreas de atendimento</h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {Object.values(LEGAL_AREA_LABELS).map((label) => (
              <span
                key={label}
                className="rounded-full border border-border-strong bg-surface px-4 py-2 text-small font-medium text-foreground-secondary transition-colors duration-150 hover:border-primary hover:text-primary"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <LawyerCta />
    </main>
  );
}
