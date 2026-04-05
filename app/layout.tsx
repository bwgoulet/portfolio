import type { Metadata } from 'next';
import './globals.css';
import { getVisualTokenCssVariables } from '@/config/visualTokens';

export const metadata: Metadata = {
  title: 'Ben Goulet',
  description: 'Point-and-click adventure inspired portfolio prototype.',
  icons: {
    icon: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 128 128%22%3E%3Cg fill=%22none%22 stroke=%22%23111827%22 stroke-width=%228%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M16 104h96%22/%3E%3Cpath d=%22M28 104l24-36 14 20 20-36 14 24 12-20 4 48%22/%3E%3C/g%3E%3C/svg%3E'
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
      </body>
    </html>
  );
}
