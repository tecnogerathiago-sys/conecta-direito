import Link from "next/link";
import { Coins } from "lucide-react";

export function CoinBalance({ balance }: { balance: number }) {
  return (
    <Link
      href="/advogado/carteira"
      className="flex items-center gap-2 rounded-md bg-accent-subtle px-3 py-1.5 text-small font-semibold text-accent transition-colors duration-150 hover:bg-accent-subtle/70"
    >
      <Coins className="size-4" aria-hidden />
      {balance.toLocaleString("pt-BR")} moedas
    </Link>
  );
}
