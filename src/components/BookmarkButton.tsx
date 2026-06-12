"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSaved } from "@/actions/saved";

export function BookmarkButton({
  restaurantId,
  initialSaved,
  size = "md",
}: {
  restaurantId: string;
  initialSaved: boolean;
  size?: "md" | "lg";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      const res = await toggleSaved(restaurantId);
      if (res.needsLogin) {
        setSaved(false);
        router.push("/login");
      } else if (res.saved !== undefined) {
        setSaved(res.saved);
      }
    });
  }

  const dim = size === "lg" ? "w-10 h-10" : "w-8 h-8";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "إزالة من المحفوظات" : "حفظ"}
      title={saved ? "إزالة من المحفوظات" : "حفظ"}
      className={`${dim} grid place-items-center rounded-[10px] bg-white/95 border border-hairline hover:border-primary-400 transition shadow-sm`}
    >
      <svg
        width={size === "lg" ? 18 : 15}
        height={size === "lg" ? 18 : 15}
        viewBox="0 0 24 24"
        fill={saved ? "var(--color-primary-500)" : "none"}
        stroke={saved ? "var(--color-primary-500)" : "var(--color-ink2)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    </button>
  );
}
