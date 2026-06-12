const AR_MAP: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ء: "", ؤ: "o", ئ: "e", ى: "a",
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh", د: "d", ذ: "th",
  ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", ة: "a", و: "w", ي: "y",
};

/** Transliterates Arabic text into a Latin URL slug (better shareability than percent-encoded Arabic). */
export function slugify(text: string): string {
  const transliterated = [...text]
    .map((ch) => AR_MAP[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    // strip Arabic diacritics (tashkeel) and combining marks
    .replace(/[ً-ٰٟ̀-ͯ]/g, "");

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Generates a unique slug by appending a counter when needed. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const root = slugify(base) || "matam";
  let candidate = root;
  let i = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${i}`;
    i++;
  }
  return candidate;
}
