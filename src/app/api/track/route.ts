import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const KIND_FIELDS = {
  call: { counter: "callClicks", daily: "calls" },
  whatsapp: { counter: "whatsappClicks", daily: "whatsapps" },
  direction: { counter: "directionClicks", daily: "directions" },
} as const;

export async function POST(req: Request) {
  let body: { restaurantId?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const kind = body.kind as keyof typeof KIND_FIELDS;
  if (!body.restaurantId || !KIND_FIELDS[kind]) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { counter, daily } = KIND_FIELDS[kind];
  const today = new Date(new Date().toISOString().slice(0, 10));

  try {
    await Promise.all([
      db.restaurant.update({
        where: { id: body.restaurantId },
        data: { [counter]: { increment: 1 } },
      }),
      db.metricDaily.upsert({
        where: {
          restaurantId_date: { restaurantId: body.restaurantId, date: today },
        },
        update: { [daily]: { increment: 1 } },
        create: { restaurantId: body.restaurantId, date: today, [daily]: 1 },
      }),
    ]);
  } catch {
    // unknown restaurant id — ignore
  }
  return NextResponse.json({ ok: true });
}
