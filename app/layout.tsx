import type { Metadata } from 'next';
import './globals.css';
import { getVisualTokenCssVariables } from '@/config/visualTokens';

export const metadata: Metadata = {
  title: 'My Climb | Adventure Prototype',
  description: 'Point-and-click adventure inspired portfolio prototype.'
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
      </body>
    </html>
  );
}
