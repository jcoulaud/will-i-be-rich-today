import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Will I Be Rich Today? 🤑',
  description: 'Find out if today is your lucky day...',
  openGraph: {
    title: 'Will I Be Rich Today? 🤑',
    description: 'Find out if today is your lucky day...',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Will I Be Rich Today? 🤑',
    description: 'Find out if today is your lucky day...',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
