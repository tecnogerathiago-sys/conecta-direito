import clsx from "clsx";

interface AvatarProps {
  name: string;
  size?: "sm" | "md";
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold",
        size === "sm" ? "size-8 text-caption" : "size-10 text-small",
        className
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
