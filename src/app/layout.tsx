import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'VitAI - Smart Nutrition Tracking',
    template: '%s | VitAI',
  },
  description: 'AI-powered nutrition tracking made simple and beautiful. Track your meals with a photo, text, or manual entry.',
  keywords: ['nutrition', 'calorie tracking', 'meal logging', 'AI', 'health', 'diet', 'fitness'],
  authors: [{ name: 'VitAI' }],
  creator: 'VitAI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VitAI',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'VitAI',
    title: 'VitAI - Smart Nutrition Tracking',
    description: 'AI-powered nutrition tracking made simple and beautiful.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VitAI - Smart Nutrition Tracking',
    description: 'AI-powered nutrition tracking made simple and beautiful.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
