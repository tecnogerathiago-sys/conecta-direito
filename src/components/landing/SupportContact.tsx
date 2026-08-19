import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER_DISPLAY = "(11) 95285-4008";
const WHATSAPP_NUMBER_LINK = "5511952854008";

export function SupportContact() {
  return (
    <section className="border-t border-border bg-background-secondary">
      <div className="mx-auto flex max-w-shell flex-col items-center gap-3 px-4 py-12 text-center sm:px-6">
        <h2 className="text-h3 text-foreground">Precisa de ajuda?</h2>
        <p className="text-small text-foreground-secondary">
          Fale com o nosso suporte pelo WhatsApp.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER_LINK}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-success px-5 py-2.5 text-small font-semibold text-success-foreground transition-colors duration-150 hover:bg-success-hover"
        >
          <MessageCircle className="size-4" aria-hidden />
          {WHATSAPP_NUMBER_DISPLAY}
        </a>
      </div>
    </section>
  );
}
