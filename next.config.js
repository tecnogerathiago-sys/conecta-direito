// Na Vercel, se NEXTAUTH_URL não for definida (ou ficar em branco), o NextAuth
// tenta construir uma URL a partir de string vazia e quebra o build inteiro.
// Mesma lógica de src/lib/auth.ts (ver comentário lá): usa o domínio estável
// de produção quando disponível, em vez da URL única do deployment.
if (!process.env.NEXTAUTH_URL) {
  const stableUrl =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  if (stableUrl) process.env.NEXTAUTH_URL = `https://${stableUrl}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
