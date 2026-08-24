import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { SUPPORT_WHATSAPP_LINK } from "@/lib/constants";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={`https://wa.me/${SUPPORT_WHATSAPP_LINK}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale com o suporte pelo WhatsApp"
      title="Fale com o suporte pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40 focus-visible:ring-offset-2"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
