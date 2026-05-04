import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VulnLab',
  description: 'Web Security Playground'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
