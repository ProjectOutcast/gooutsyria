"use client";

import { useState } from "react";
import { EventIcon } from "./EventIcon";

const btn =
  "inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white backdrop-blur rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-colors";

export function EventHeroActions({ title }: { title: string }) {
  const [saved, setSaved] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // user dismissed the share sheet — ignore
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={share} className={btn}>
        <EventIcon name="share-2" size={15} />
        مشاركة
      </button>
      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        aria-pressed={saved}
        className={btn}
      >
        <EventIcon name="bookmark" size={15} strokeWidth={saved ? 2.6 : 2} />
        {saved ? "محفوظ" : "حفظ"}
      </button>
    </div>
  );
}
