// Serializable, client-safe shapes passed from the server pages to the
// interactive event components. (No imports — must not pull in the DB layer.)

export type EventCardData = {
  id: string;
  slug: string;
  href: string;
  title: string;
  category: string; // slug, for filtering
  categoryAr: string;
  icon: string; // lucide name
  venue: string;
  area: string;
  timeLabel: string;
  priceLabel: string;
  free: boolean;
  bg: string; // precomputed CSS background for the placeholder
  imageUrl: string | null;
  dayIndex: number; // 0–7 within the day-strip window
};

export type FeaturedSlideData = {
  id: string;
  href: string;
  kicker: string;
  title: string;
  desc: string;
  dateLabel: string;
  venue: string;
  icon: string;
  bg: string;
  imageUrl: string | null;
};

export type DayMetaData = {
  index: number;
  dowAr: string;
  dayNum: string;
};

export type CategoryData = { slug: string; nameAr: string; icon: string };
