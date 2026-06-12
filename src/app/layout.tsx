import type { Metadata } from "next";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Go Out Syria — دليل المطاعم والكافيهات في سوريا",
    template: "%s | Go Out Syria",
  },
  description:
    "اكتشف أفضل المطاعم والكافيهات في دمشق وسوريا: قوائم طعام، أسعار، تقييمات حقيقية، عروض، وصور. دليلك الكامل لطلعتك القادمة.",
  openGraph: {
    siteName: "Go Out Syria",
    locale: "ar_SY",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
