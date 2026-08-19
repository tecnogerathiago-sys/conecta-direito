import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Mutar process.env no next.config.js só afeta o processo de build — cada
// invocação de função serverless na Vercel roda em um processo novo que não
// herda isso. Por isso o fallback precisa rodar aqui também, em runtime,
// antes do NextAuth tentar ler NEXTAUTH_URL (o que ele faz internamente ao
// montar a URL base via `new URL(...)`, quebrando com string vazia).
//
// VERCEL_URL aponta para a URL única *daquele deployment* (com hash), que
// muda a cada deploy — não para o domínio estável de produção. Usar VERCEL_URL
// em produção faz o NextAuth validar CSRF/cookies contra um host diferente do
// que o navegador está usando, e o login falha silenciosamente. Em produção,
// VERCEL_PROJECT_PRODUCTION_URL é o domínio estável correto; em previews,
// cada deployment é o próprio destino, então VERCEL_URL está certo ali.
if (!process.env.NEXTAUTH_URL) {
  const stableUrl =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  if (stableUrl) process.env.NEXTAUTH_URL = `https://${stableUrl}`;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/advogado/entrar" },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
