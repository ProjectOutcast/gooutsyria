"use client";

import { useRef, useState } from "react";

/**
 * Lazy map: maplibre-gl (~200KB) is only downloaded when the user asks for the
 * map — critical on Syrian connections where data is slow and metered.
 */
export function MapView({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready">("idle");

  async function loadMap() {
    if (state !== "idle" || !containerRef.current) return;
    setState("loading");
    const maplibregl = (await import("maplibre-gl")).default;
    await import("maplibre-gl/dist/maplibre-gl.css" as string);
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
      center: [lng, lat],
      zoom: 15,
      attributionControl: { compact: true },
    });
    new maplibregl.Marker({ color: "#d22b2b" })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup().setText(name))
      .addTo(map);
    setState("ready");
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-stone-200 h-64 bg-stone-100">
      <div ref={containerRef} className="absolute inset-0" />
      {state !== "ready" && (
        <button
          type="button"
          onClick={loadMap}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-600 hover:bg-stone-200/50"
        >
          <span className="text-3xl">📍</span>
          <span className="font-semibold text-sm">
            {state === "loading" ? "جارٍ تحميل الخريطة…" : "اضغط لعرض الخريطة"}
          </span>
        </button>
      )}
    </div>
  );
}
