"use client";

type Kind = "call" | "whatsapp" | "direction";

function track(restaurantId: string, kind: Kind) {
  try {
    navigator.sendBeacon(
      "/api/track",
      JSON.stringify({ restaurantId, kind })
    );
  } catch {
    // analytics must never block the action
  }
}

export function TrackedAction({
  restaurantId,
  kind,
  href,
  className,
  children,
}: {
  restaurantId: string;
  kind: Kind;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={kind === "call" ? undefined : "_blank"}
      rel="noopener"
      className={className}
      onClick={() => track(restaurantId, kind)}
    >
      {children}
    </a>
  );
}
