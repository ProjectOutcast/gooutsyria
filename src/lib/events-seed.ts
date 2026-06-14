/**
 * Demo events for the "وين نروح؟" directory. Idempotent (upsert by slug).
 * Dates are anchored to the Damascus "today" at seed time so the day-strip
 * landing is always populated.
 */
import type { PrismaClient } from "../generated/prisma/client";

type SeedEvent = {
  slug: string;
  city?: string; // city slug; defaults to "damascus"
  title: string;
  category: string;
  venue: string;
  area: string;
  day: number; // offset from today (0–7)
  endDay?: number; // for multi-day events
  timeLabel: string;
  priceFrom?: number;
  priceNote?: string;
  tone: string;
  featured?: boolean;
  featuredKicker?: string;
  summary?: string;
  description?: string;
  outlets?: { icon?: string; name: string; note?: string; phone: string }[];
  program?: { dayOffset: number; title: string; detail?: string; time?: string }[];
  organizer?: { name: string; note?: string; phone?: string; website?: string; verified?: boolean };
};

const DEFAULT_ORGANIZER = {
  name: "المؤسسة العامة للمسارح والموسيقى",
  note: "منظّم موثوق",
  phone: "+963 11 445 6677",
  verified: true,
};

const DEFAULT_OUTLETS = [
  { icon: "building", name: "شبّاك التذاكر — صالة الفعالية", note: "يومياً ١٠:٠٠ ص – ٨:٠٠ م", phone: "+963 11 612 3456" },
  { icon: "book-open", name: "مكتبة الفنون — شارع الحمراء", note: "ما عدا الجمعة", phone: "+963 11 223 7788" },
  { icon: "ticket", name: "نقطة بيع المركز الثقافي", note: "عند المدخل قبل العرض", phone: "+963 11 331 9090" },
];

const LOREM =
  "تجربة دمشقية لا تُفوّت تجمع بين الأصالة والحداثة في أجواء استثنائية. ندعوكم لقضاء أمسية مميّزة بصحبة العائلة والأصدقاء.\n\nاحجزوا تذاكركم مبكراً من أماكن البيع المعتمدة، فالأماكن محدودة. للاستفسار تواصلوا مع المنظّم مباشرةً.";

const EVENTS: SeedEvent[] = [
  {
    slug: "damascus-film-festival-2026",
    title: "مهرجان دمشق السينمائي الدولي ٢٠٢٦",
    category: "festival",
    venue: "المركز الثقافي العربي",
    area: "المزة",
    day: 2,
    endDay: 7,
    timeLabel: "٧:٣٠ م",
    priceFrom: 25000,
    tone: "d",
    featured: true,
    featuredKicker: "مهرجان · ٦ أيام",
    summary: "أكثر من ٤٠ فيلماً من ١٢ دولة، عروض أولى وندوات مع صنّاع الأفلام في قلب دمشق.",
    description:
      "تعود الدورة الجديدة من مهرجان دمشق السينمائي الدولي بأكثر من ٤٠ فيلماً روائياً ووثائقياً من ١٢ دولة، إضافةً إلى عروض أولى وجلسات حوارية مع المخرجين والنقّاد.\n\nيمتدّ المهرجان على ستة أيام بين المركز الثقافي العربي وصالات السينما في المدينة، مع برنامج خاصّ للأفلام السورية الجديدة.",
    organizer: { name: "المؤسسة العامة للسينما", note: "منظّم موثوق · ١٢ فعالية", phone: "+963 11 612 3456", verified: true },
    outlets: [
      { icon: "building", name: "شبّاك التذاكر — المركز الثقافي العربي", note: "يومياً ١٠:٠٠ ص – ٨:٠٠ م", phone: "+963 11 612 3456" },
      { icon: "book-open", name: "مكتبة الفنون — شارع الحمراء", note: "ما عدا الجمعة", phone: "+963 11 223 7788" },
      { icon: "clapperboard", name: "صالة سينما الكندي", note: "عند مدخل الصالة قبل العرض", phone: "+963 11 331 9090" },
    ],
    program: [
      { dayOffset: 2, title: "حفل الافتتاح والعرض الأول", detail: "فيلم الافتتاح وسجادة حمراء", time: "٧:٣٠ م" },
      { dayOffset: 3, title: "بانوراما الفيلم العربي", detail: "ثلاثة عروض + ندوة", time: "٥:٠٠ م" },
      { dayOffset: 4, title: "مسابقة الأفلام القصيرة", detail: "عروض متتالية", time: "٦:٠٠ م" },
      { dayOffset: 5, title: "يوم السينما السورية", detail: "أفلام جديدة ولقاءات", time: "٥:٣٠ م" },
      { dayOffset: 6, title: "أفلام عالمية مختارة", detail: "عروض أولى", time: "٧:٠٠ م" },
      { dayOffset: 7, title: "حفل الختام وتوزيع الجوائز", detail: "إعلان النتائج", time: "٨:٠٠ م" },
    ],
  },
  {
    slug: "syrian-national-orchestra",
    title: "الأوركسترا الوطنية السورية",
    category: "music",
    venue: "دار الأوبرا السورية",
    area: "أبو رمانة",
    day: 1,
    timeLabel: "٨:٠٠ م",
    priceFrom: 35000,
    tone: "a",
    featured: true,
    featuredKicker: "حفل خاص",
    summary: "ليلة استثنائية من الموسيقى الكلاسيكية والشرقية على مسرح دار الأوبرا.",
    description:
      "تقدّم الأوركسترا الوطنية السورية أمسية موسيقية تجمع بين روائع الموسيقى الكلاسيكية العالمية ومختارات من التراث الشرقي، بقيادة نخبة من العازفين.\n\nأمسية تناسب عشّاق الموسيقى من كلّ الأعمار في أجواء دار الأوبرا الفخمة.",
  },
  {
    slug: "damascus-book-fair",
    title: "معرض دمشق الدولي للكتاب",
    category: "expo",
    venue: "مكتبة الأسد الوطنية",
    area: "عرنوس",
    day: 0,
    endDay: 7,
    timeLabel: "طوال اليوم",
    priceNote: "دخول مجاني",
    tone: "b",
    featured: true,
    featuredKicker: "معرض",
    summary: "مئات دور النشر العربية، توقيعات، وفعاليات للأطفال طوال الأسبوع.",
    description:
      "يستضيف معرض دمشق الدولي للكتاب مئات دور النشر من مختلف الدول العربية، مع برنامج يوميّ من جلسات التوقيع والندوات الأدبية وفعاليات الأطفال.\n\nالدخول مجاني طوال أيام المعرض.",
  },
  { slug: "opera-tarab-night", title: "أمسية طربية مع نجوم الشام", category: "music", venue: "دار الأوبرا", area: "أبو رمانة", day: 0, timeLabel: "٨:٣٠ م", priceFrom: 30000, tone: "a", summary: "ليلة طربية أصيلة مع نخبة من فناني دمشق." },
  { slug: "hamra-shahrazad", title: "مسرحية: عودة شهرزاد", category: "theatre", venue: "مسرح الحمراء", area: "وسط البلد", day: 0, timeLabel: "٧:٠٠ م", priceFrom: 20000, tone: "b", summary: "عمل مسرحي يعيد قراءة حكايات شهرزاد بروح معاصرة." },
  { slug: "citadel-jazz", title: "ليلة جاز في القلعة", category: "music", venue: "قلعة دمشق", area: "دمشق القديمة", day: 0, timeLabel: "٩:٠٠ م", priceFrom: 40000, tone: "c", summary: "أمسية جاز تحت نجوم قلعة دمشق التاريخية." },
  { slug: "nawfara-hakawati", title: "حكواتي النوفرة", category: "culture", venue: "مقهى النوفرة", area: "دمشق القديمة", day: 0, timeLabel: "٦:٣٠ م", priceNote: "مجاني", tone: "d", summary: "جلسة حكواتي تقليدية على طريقة دمشق القديمة." },
  { slug: "tishreen-family-day", title: "يوم عائلي في حديقة تشرين", category: "family", venue: "حديقة تشرين", area: "كفرسوسة", day: 0, timeLabel: "١٠:٠٠ ص", priceNote: "دخول مجاني", tone: "e", summary: "أنشطة وألعاب للعائلة في أجواء الحديقة." },
  { slug: "arabic-calligraphy-workshop", title: "ورشة الخط العربي", category: "workshop", venue: "بيت جبري", area: "دمشق القديمة", day: 0, timeLabel: "٥:٠٠ م", priceFrom: 15000, tone: "f", summary: "تعلّم أساسيات الخط العربي مع خطّاط محترف." },
  { slug: "abbasiyyin-friendly-match", title: "مباراة ودية: الجيش × الوحدة", category: "sports", venue: "ملعب العباسيين", area: "العباسيين", day: 1, timeLabel: "٦:٠٠ م", priceFrom: 10000, tone: "c", summary: "ديربي دمشقي ودّي بين الجيش والوحدة." },
  { slug: "crafts-market", title: "سوق الحرفيين اليدوية", category: "market", venue: "التكية السليمانية", area: "وسط البلد", day: 2, timeLabel: "١١:٠٠ ص", priceNote: "دخول مجاني", tone: "e", summary: "منتجات حرفية يدوية من صنّاع دمشق." },
  { slug: "damascene-poetry-night", title: "أمسية شعرية دمشقية", category: "culture", venue: "المركز الثقافي الروسي", area: "أبو رمانة", day: 3, timeLabel: "٦:٠٠ م", priceNote: "مجاني", tone: "f", summary: "أمسية شعر مع نخبة من شعراء دمشق." },
  { slug: "kids-sindbad", title: "مسرح الأطفال: مغامرة سندباد", category: "family", venue: "مسرح القباني", area: "وسط البلد", day: 3, timeLabel: "٤:٠٠ م", priceFrom: 12000, tone: "a", summary: "عرض مسرحي شيّق للأطفال عن مغامرات سندباد." },
  { slug: "tech-innovation-expo", title: "معرض التقنية والابتكار", category: "expo", venue: "معرض دمشق الدولي", area: "أوتوستراد المزة", day: 4, timeLabel: "طوال اليوم", priceFrom: 8000, tone: "b", summary: "أحدث المشاريع التقنية والشركات الناشئة." },
  { slug: "sufi-inshad-night", title: "حفل إنشاد ومولوية", category: "music", venue: "التكية السليمانية", area: "وسط البلد", day: 5, timeLabel: "٩:٣٠ م", priceFrom: 25000, tone: "a", summary: "أمسية إنشاد صوفي وعرض مولوية." },
  { slug: "standup-comedy-night", title: "ستاند أب كوميدي", category: "theatre", venue: "مسرح سعد الله ونوس", area: "المزة", day: 5, timeLabel: "٨:٠٠ م", priceFrom: 30000, tone: "b", summary: "ليلة ضحك مع ألمع نجوم الكوميديا." },
  { slug: "damascene-food-festival", title: "مهرجان الأكل الدمشقي", category: "festival", venue: "ساحة الأمويين", area: "وسط البلد", day: 5, timeLabel: "٥:٠٠ م", priceNote: "دخول مجاني", tone: "e", summary: "أشهى الأطباق الدمشقية في مكان واحد." },
  { slug: "fairuz-tribute-night", title: "أمسية فيروزية", category: "music", venue: "دار الأوبرا", area: "أبو رمانة", day: 6, timeLabel: "٨:٣٠ م", priceFrom: 35000, tone: "a", summary: "أجمل أغاني فيروز بأداء حيّ على المسرح." },
  { slug: "damascus-charity-marathon", title: "ماراثون دمشق الخيري", category: "sports", venue: "ساحة الأمويين", area: "وسط البلد", day: 6, timeLabel: "٧:٠٠ ص", priceNote: "تسجيل مسبق", tone: "c", summary: "اركض لأجل الخير في شوارع دمشق." },
  { slug: "antiques-market", title: "سوق الأنتيك والتحف", category: "market", venue: "خان أسعد باشا", area: "دمشق القديمة", day: 6, timeLabel: "١٠:٠٠ ص", priceNote: "دخول مجاني", tone: "d", summary: "تحف وقطع أنتيك نادرة في خان تاريخي." },
  { slug: "world-opera-night", title: "ليلة الأوبرا العالمية", category: "music", venue: "دار الأوبرا", area: "أبو رمانة", day: 7, timeLabel: "٨:٠٠ م", priceFrom: 40000, tone: "b", summary: "روائع الأوبرا العالمية بأصوات استثنائية." },
  { slug: "king-lear-play", title: "مسرحية كلاسيكية: الملك لير", category: "theatre", venue: "مسرح الحمراء", area: "وسط البلد", day: 7, timeLabel: "٧:٣٠ م", priceFrom: 22000, tone: "a", summary: "تقديم كلاسيكي لرائعة شكسبير الملك لير." },

  // --- Aleppo (حلب) ---
  { slug: "aleppo-citadel-music-night", city: "aleppo", title: "ليلة موسيقية في قلعة حلب", category: "music", venue: "قلعة حلب", area: "القلعة", day: 1, timeLabel: "٨:٠٠ م", priceFrom: 30000, tone: "a", featured: true, featuredKicker: "حفل خاص", summary: "أمسية موسيقية في أجواء قلعة حلب التاريخية." },
  { slug: "aleppo-cuisine-festival", city: "aleppo", title: "مهرجان المطبخ الحلبي", category: "festival", venue: "حديقة السبيل", area: "السبيل", day: 0, endDay: 3, timeLabel: "٥:٠٠ م", priceNote: "دخول مجاني", tone: "e", featured: true, featuredKicker: "مهرجان · ٤ أيام", summary: "أشهى أطباق المطبخ الحلبي العريق في مكان واحد." },
  { slug: "aleppo-muwashahat-night", city: "aleppo", title: "أمسية موشحات وقدود حلبية", category: "music", venue: "بيت الصابوني", area: "الجديدة", day: 2, timeLabel: "٩:٠٠ م", priceFrom: 25000, tone: "f", summary: "ليلة موشحات وقدود حلبية أصيلة." },
  { slug: "aleppo-handicrafts-market", city: "aleppo", title: "سوق الحرف الحلبية", category: "market", venue: "خان الوزير", area: "المدينة القديمة", day: 3, timeLabel: "١١:٠٠ ص", priceNote: "دخول مجاني", tone: "d", summary: "حرف يدوية وصابون الغار ومنتجات حلبية تقليدية." },
  { slug: "aleppo-theatre-hakaya", city: "aleppo", title: "مسرحية: حكايا حلبية", category: "theatre", venue: "المسرح القومي بحلب", area: "العزيزية", day: 4, timeLabel: "٧:٣٠ م", priceFrom: 20000, tone: "b", summary: "عرض مسرحي يحاكي الحياة الحلبية الأصيلة." },
  { slug: "aleppo-derby-match", city: "aleppo", title: "ديربي حلب: الاتحاد × الحرية", category: "sports", venue: "ملعب حلب الدولي", area: "الحمدانية", day: 5, timeLabel: "٦:٠٠ م", priceFrom: 10000, tone: "c", summary: "ديربي حلبي مرتقب بين الاتحاد والحرية." },
];

// Higgsfield-generated cover photos for the demo events, keyed by slug.
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3EheDHYPzspdioz8fQRTl2NIv7K/";
const IMAGES: Record<string, string> = {
  "damascus-film-festival-2026": CDN + "hf_20260614_075930_73668daa-bc5d-4501-9963-7f1b04039e12.png",
  "syrian-national-orchestra": CDN + "hf_20260614_075844_0c19fcfa-2988-438c-bf2a-30077de2f405.png",
  "damascus-book-fair": CDN + "hf_20260614_075932_fd65934e-cfc6-4a77-a524-911e3397f8e3.png",
  "opera-tarab-night": CDN + "hf_20260614_075933_df8a3b17-9ffa-448d-aad4-7c7ddf0d7780.png",
  "hamra-shahrazad": CDN + "hf_20260614_075935_ad4d9304-b528-4384-aceb-72d7fa4b8ad8.png",
  "citadel-jazz": CDN + "hf_20260614_080237_1253fbca-0d19-4fc8-96ba-02bd6030c8b6.png",
  "nawfara-hakawati": CDN + "hf_20260614_080239_edbb0093-ce7d-4259-a4b7-0551c3b2ba99.png",
  "tishreen-family-day": CDN + "hf_20260614_080241_51af36dd-b699-4eef-9fb6-be43fcf3ec26.png",
  "arabic-calligraphy-workshop": CDN + "hf_20260614_080242_5e936b47-bbb1-4045-9af1-ca2016b991db.png",
  "abbasiyyin-friendly-match": CDN + "hf_20260614_080318_92acc488-c555-463a-aaf3-459a2c05f554.png",
  "crafts-market": CDN + "hf_20260614_080320_4d1ac31e-70fa-402d-9f6e-e8d1e016c4ab.png",
  "damascene-poetry-night": CDN + "hf_20260614_080321_4c841019-b4a5-49bf-84ce-c095c91ea560.png",
  "kids-sindbad": CDN + "hf_20260614_080323_8a932803-4e04-41bd-973e-dc0e3a0c2364.png",
  "tech-innovation-expo": CDN + "hf_20260614_080345_ed4ed399-fadf-4ef3-b19d-48dfc36a636d.png",
  "sufi-inshad-night": CDN + "hf_20260614_080346_39c8e42a-b64a-40ee-99fa-63775be8f933.png",
  "standup-comedy-night": CDN + "hf_20260614_080348_3abeaff3-5cdf-46b8-82da-7e8deb8952a9.png",
  "damascene-food-festival": CDN + "hf_20260614_080349_b72a9994-140c-4408-b19d-0b86770fb3b8.png",
  "fairuz-tribute-night": CDN + "hf_20260614_080614_6b8bb8a2-caf3-4b5b-ab56-f1344ac6694f.png",
  "damascus-charity-marathon": CDN + "hf_20260614_080421_68df891e-8b07-4deb-8baa-89a4a5536edf.png",
  "antiques-market": CDN + "hf_20260614_080422_9d8cbb0b-4858-4a5d-814f-e2583eb0a9cd.png",
  "world-opera-night": CDN + "hf_20260614_080426_6f0845ef-6f8b-43bd-bba0-df0dd41ef577.png",
  "king-lear-play": CDN + "hf_20260614_080444_2a3b1fe4-e139-43d9-b5d8-5fe6c5298681.png",
};

export async function seedEvents(db: PrismaClient): Promise<number> {
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Damascus",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  // noon UTC on the Damascus "today" → safely inside that Damascus calendar day
  const base = new Date(`${todayKey}T12:00:00.000Z`).getTime();
  const at = (offset: number) => new Date(base + offset * 86_400_000);

  const cityRows = await db.city.findMany({
    where: { slug: { in: ["damascus", "aleppo"] } },
    select: { id: true, slug: true },
  });
  const cityId = new Map(cityRows.map((c) => [c.slug, c.id]));

  let n = 0;
  for (const e of EVENTS) {
    const cid = cityId.get(e.city ?? "damascus");
    if (!cid) continue; // city not seeded — skip
    const program = e.program?.map((p) => ({
      date: at(p.dayOffset).toISOString(),
      title: p.title,
      detail: p.detail,
      time: p.time,
    }));
    const data = {
      title: e.title,
      summary: e.summary ?? null,
      description: e.description ?? LOREM,
      category: e.category,
      venue: e.venue,
      area: e.area,
      startsAt: at(e.day),
      endsAt: e.endDay != null ? at(e.endDay) : null,
      timeLabel: e.timeLabel,
      priceFrom: e.priceFrom ?? null,
      priceNote: e.priceNote ?? null,
      tone: e.tone,
      cityId: cid,
      imageUrl: IMAGES[e.slug] ?? null,
      featured: e.featured ?? false,
      featuredKicker: e.featuredKicker ?? null,
      organizer: e.organizer ?? DEFAULT_ORGANIZER,
      outlets: e.outlets ?? DEFAULT_OUTLETS,
      program: program ?? undefined,
    };
    await db.event.upsert({
      where: { slug: e.slug },
      update: data,
      create: { slug: e.slug, ...data },
    });
    n++;
  }
  return n;
}
