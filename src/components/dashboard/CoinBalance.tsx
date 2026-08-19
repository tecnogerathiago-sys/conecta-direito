import Link from "next/link";

export function CoinBalance({ balance }: { balance: number }) {
  return (
    <Link
      href="/advogado/carteira"
      className="flex items-center gap-1.5 rounded-full bg-accent-50 px-3.5 py-1.5 text-sm font-semibold text-accent-600 hover:bg-accent-100"
    >
      <span aria-hidden>🪙</span>
      {balance.toLocaleString("pt-BR")} moedas
    </Link>
  );
}
