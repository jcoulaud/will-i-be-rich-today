import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Will I Be Rich Today?',
  description:
    'Community-driven fortune teller for memecoin traders. Add your own predictions and see what the community thinks about your future wealth! 🤑',
  openGraph: {
    title: 'Will I Be Rich Today?',
    description:
      'Community-driven fortune teller for memecoin traders. Add your own predictions and see what the community thinks about your future wealth! 🤑',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Will I Be Rich Today?',
    description:
      'Community-driven fortune teller for memecoin traders. Add your own predictions and see what the community thinks about your future wealth! 🤑',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
