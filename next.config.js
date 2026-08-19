// Na Vercel, se NEXTAUTH_URL não for definida (ou ficar em branco), o NextAuth
// tenta construir uma URL a partir de string vazia e quebra o build inteiro.
// VERCEL_URL é preenchida automaticamente pela plataforma em todo deploy
// (produção e preview), então usamos como fallback quando NEXTAUTH_URL
// não foi configurada manualmente.
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
