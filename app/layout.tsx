import type { Metadata } from 'next';
import './globals.css';
import { getVisualTokenCssVariables } from '@/config/visualTokens';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Ben Goulet',
  description: 'Point-and-click adventure inspired portfolio prototype.',
  icons: {
    icon: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E%F0%9F%97%BB%3C/text%3E%3C/svg%3E'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cssVariables = Object.entries(getVisualTokenCssVariables())
    .map(([name, value]) => `${name}:${value};`)
    .join('');

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <style>{`:root{${cssVariables}}`}</style>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
