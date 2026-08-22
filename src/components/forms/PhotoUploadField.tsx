"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  photoUrl: string | undefined;
  avatarName: string;
  onUploaded: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export function PhotoUploadField({ photoUrl, avatarName, onUploaded, onUploadingChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    onUploadingChange?.(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/photo", { method: "POST", body: formData });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Não foi possível enviar a imagem.");
      onUploaded(body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao enviar a imagem.");
      setPreview(null);
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  }

  const displaySrc = preview ?? photoUrl;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="relative">
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displaySrc}
              alt="Pré-visualização da foto de perfil"
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <Avatar name={avatarName || "?"} size="md" />
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
              <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Camera className="size-4" aria-hidden />
            {isUploading ? "Enviando..." : displaySrc ? "Trocar foto" : "Enviar foto de perfil"}
          </Button>
          <span className="text-caption text-foreground-muted">
            Opcional. JPG, PNG, WEBP ou GIF, até 5MB.
          </span>
        </div>
      </div>
      {error && <p className="text-small text-destructive">{error}</p>}
    </div>
  );
}
