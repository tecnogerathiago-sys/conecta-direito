import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Upload de foto de perfil do advogado (Vercel Blob). Sem autenticação de
 * propósito — é usado no próprio formulário de cadastro, antes de a conta
 * existir. Só valida tipo/tamanho do arquivo; não é um endpoint genérico de
 * upload (path é fixo em lawyer-photos/), mas também não tem rate limit —
 * ok pro volume esperado agora, revisar se virar alvo de abuso.
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato inválido. Envie uma imagem JPG, PNG, WEBP ou GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máximo de 5MB)." }, { status: 400 });
  }

  try {
    const blob = await put(`lawyer-photos/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Não foi possível enviar a imagem." }, { status: 502 });
  }
}
