import clsx from "clsx";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, photoUrl, size = "md", className }: AvatarProps) {
  const sizeClass = size === "sm" ? "size-8 text-caption" : "size-10 text-small";

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL externa arbitrária, sem otimização do Next.
      <img
        src={photoUrl}
        alt=""
        className={clsx("shrink-0 rounded-full object-cover", sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold",
        sizeClass,
        className
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
