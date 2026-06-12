"use client";

import { useEffect, useRef, useState } from "react";

export type MapMarker = { lat: number; lng: number; name: string; href?: string };

/**
 * Lazy map: maplibre-gl (~200KB) is only downloaded when the user asks for the
 * map — critical on Syrian connections where data is slow and metered.
 * Set `autoload` for dedicated map pages.
 */
export function MapView({
  markers,
  autoload = false,
  className = "h-64",
}: {
  markers: MapMarker[];
  autoload?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready">("idle");
  const startedRef = useRef(false);

  async function loadMap() {
    if (startedRef.current || !containerRef.current || markers.length === 0) return;
    startedRef.current = true;
    setState("loading");
    const maplibregl = (await import("maplibre-gl")).default;
    await import("maplibre-gl/dist/maplibre-gl.css" as string);

    const center: [number, number] =
      markers.length === 1
        ? [markers[0].lng, markers[0].lat]
        : [
            markers.reduce((s, m) => s + m.lng, 0) / markers.length,
            markers.reduce((s, m) => s + m.lat, 0) / markers.length,
          ];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center,
      zoom: markers.length === 1 ? 15 : 13,
      attributionControl: { compact: true },
    });

    for (const m of markers) {
      const popupHtml = m.href
        ? `<a href="${m.href}" style="font-weight:700">${m.name}</a>`
        : `<span style="font-weight:700">${m.name}</span>`;
      new maplibregl.Marker({ color: "#E14434" })
        .setLngLat([m.lng, m.lat])
        .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml))
        .addTo(map);
    }
    setState("ready");
  }

  useEffect(() => {
    if (autoload) loadMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoload]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-hairline bg-chipbg ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {state !== "ready" && !autoload && (
        <button
          type="button"
          onClick={loadMap}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink2 hover:bg-hairline/40"
        >
          <span className="text-3xl">📍</span>
          <span className="font-semibold text-sm">
            {state === "loading" ? "جارٍ تحميل الخريطة…" : "اضغط لعرض الخريطة"}
          </span>
        </button>
      )}
      {state === "loading" && autoload && (
        <span className="absolute inset-0 grid place-items-center text-sm text-ink2">
          جارٍ تحميل الخريطة…
        </span>
      )}
    </div>
  );
}
