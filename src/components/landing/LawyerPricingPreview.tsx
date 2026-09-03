import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions";
import { formatBRL } from "@/lib/format";

export function LawyerPricingPreview() {
  return (
    <section id="planos" className="border-t border-border bg-background-secondary">
      <div className="mx-auto max-w-shell px-4 py-20 sm:px-6">
        <h2 className="mb-12 text-center text-h1 text-foreground">Planos</h2>

        <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
          {SUBSCRIPTION_PLANS.map((planDef, i) => (
            <Card key={planDef.plan} className={i === SUBSCRIPTION_PLANS.length - 1 ? "border-primary shadow-md" : ""}>
              <h3 className="text-h3 text-foreground">{planDef.name}</h3>
              <p className="mt-2 text-h1 leading-none text-foreground">{formatBRL(planDef.priceBRL)}</p>
              <p className="mt-1 text-small text-foreground-muted">por mês</p>
              <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                {planDef.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-small text-foreground-secondary">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/advogado/cadastrar">
            <Button variant="primary" size="lg">
              Criar conta e assinar
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
