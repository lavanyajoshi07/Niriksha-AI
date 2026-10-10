import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Niriksha AI — Bharat Sentinel Infrastructure Intelligence Platform',
  description: 'Predict. Prevent. Protect. Next-Gen Public Asset Governance & Incident Resolution Platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
