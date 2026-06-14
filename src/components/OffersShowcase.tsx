"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type OfferCardData = {
  id: string;
  titleAr: string;
  descAr: string | null;
  startsAtLabel: string;
  endsAtLabel: string;
  endsAtShort: string;
  daysLeft: number;
  restaurant: {
    nameAr: string;
    href: string;
    neighborhoodAr: string | null;
    cuisineAr: string | null;
    photoUrl: string | null;
    avgRating: number;
    ratingCount: number;
  };
};

/** Real-deadline cue ("حتى ١٦/٧") — turns warm/red when the offer is about to end. */
function urgency(offer: OfferCardData): { label: string; urgent: boolean } {
  return { label: `حتى ${offer.endsAtShort}`, urgent: offer.daysLeft <= 3 };
}

function Subline({ offer }: { offer: OfferCardData }) {
  const parts = [offer.restaurant.cuisineAr, offer.restaurant.neighborhoodAr].filter(Boolean);
  return <>{parts.join(" · ")}</>;
}

function OfferCard({ offer, onOpen }: { offer: OfferCardData; onOpen: () => void }) {
  const u = urgency(offer);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-start bg-white border border-hairline rounded-2xl overflow-hidden transition hover:-translate-y-1 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="relative aspect-[16/9] bg-chipbg">
        {offer.restaurant.photoUrl ? (
          <Image
            src={offer.restaurant.photoUrl}
            alt={offer.restaurant.nameAr}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-bl from-primary-100 to-primary-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
        <span className="absolute top-3 start-3 inline-flex items-center gap-1 bg-primary-500 text-white text-[13px] font-extrabold rounded-full px-3 py-1 shadow-accent">
          🔥 {offer.titleAr}
        </span>
        <span
          className={`absolute top-3 end-3 text-[11px] font-bold rounded-full px-2.5 py-1 backdrop-blur ${
            u.urgent ? "bg-warn/90 text-white" : "bg-white/85 text-ink"
          }`}
        >
          {u.label}
        </span>
        <div className="absolute bottom-0 inset-x-0 p-3.5">
          <h3 className="text-white font-bold text-[17px] leading-tight line-clamp-1 drop-shadow">
            {offer.restaurant.nameAr}
          </h3>
          <p className="text-white/85 text-[12px] mt-0.5 line-clamp-1">
            <Subline offer={offer} />
          </p>
        </div>
      </div>
    </button>
  );
}

function OfferModal({ offer, onClose }: { offer: OfferCardData; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const u = urgency(offer);
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={offer.titleAr}
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="relative aspect-[16/9] bg-chipbg">
          {offer.restaurant.photoUrl ? (
            <Image
              src={offer.restaurant.photoUrl}
              alt={offer.restaurant.nameAr}
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-bl from-primary-200 to-primary-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <span className="absolute top-3.5 start-3.5 inline-flex items-center gap-1 bg-primary-500 text-white text-sm font-extrabold rounded-full px-3.5 py-1.5 shadow-accent">
            🔥 {offer.titleAr}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-3.5 end-3.5 grid place-items-center w-9 h-9 rounded-full bg-ink/45 hover:bg-ink/70 text-white backdrop-blur transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h2 className="text-white font-bold text-xl leading-tight drop-shadow">
              {offer.restaurant.nameAr}
            </h2>
            <p className="text-white/85 text-[13px] mt-0.5">
              <Subline offer={offer} />
            </p>
          </div>
        </div>

        <div className="p-5">
          <span
            className={`inline-block text-[12px] font-bold rounded-full px-3 py-1 ${
              u.urgent ? "bg-warn/10 text-warn" : "bg-chipbg text-ink2"
            }`}
          >
            {u.label}
          </span>

          {offer.descAr && (
            <p className="text-[15px] text-ink2 leading-relaxed mt-4">{offer.descAr}</p>
          )}

          <div className="flex items-center gap-2 text-[13px] text-muted mt-4 bg-page rounded-xl px-3.5 py-3 border border-hairline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>
              مدة العرض: من <span className="text-ink font-semibold">{offer.startsAtLabel}</span> إلى{" "}
              <span className="text-ink font-semibold">{offer.endsAtLabel}</span>
            </span>
          </div>

          <Link
            href={offer.restaurant.href}
            className="flex items-center justify-center gap-2 mt-5 w-full bg-primary-500 hover:bg-primary-700 text-white rounded-xl px-6 py-3.5 font-bold shadow-accent transition-colors"
          >
            زيارة المطعم
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m14 6-6 6 6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function OffersShowcase({ offers }: { offers: OfferCardData[] }) {
  const [selected, setSelected] = useState<OfferCardData | null>(null);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => (
          <OfferCard key={o.id} offer={o} onOpen={() => setSelected(o)} />
        ))}
      </div>
      {selected && <OfferModal offer={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
