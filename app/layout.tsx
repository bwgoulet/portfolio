import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Climb | Adventure Prototype',
  description: 'Point-and-click adventure inspired portfolio prototype.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
