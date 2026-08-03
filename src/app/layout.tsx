import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fredoka",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "WordTeam - Fun Word Game for you and your team",
  description: "An exciting word game to challenge your vocabulary. Win points for your team and climb the leaderboard!",
  keywords: "word game, team game, vocabulary, multiplayer, online game, word puzzle, team competition",
  authors: [{ name: "WordTeam" }],
  creator: "WordTeam",
  publisher: "WordTeam",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://playwordteam.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "WordTeam - Fun Word Game for you and your team",
    description: "An exciting word game to challenge your vocabulary. Win points for your team and climb the leaderboard!",
    url: 'https://playwordteam.com',
    siteName: 'WordTeam',
    images: [
      {
        url: '/word-team-logo.svg',
        width: 300,
        height: 300,
        alt: 'WordTeam Game',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "WordTeam - Fun Word Game for you and your team",
    description: "An exciting word game to challenge your vocabulary. Win points for your team and climb the leaderboard!",
    images: ['/word-team-logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${fredoka.variable} font-fredoka`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
