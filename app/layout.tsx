import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DEXTER APIS — 40+ Production APIs',
  description: 'AI, downloaders, movies, Sri Lankan news, tools, fun and more. Free tier forever, subscriptions for power users.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} min-h-screen bg-[#07070d] text-zinc-100 antialiased`}>
        <ToastProvider>
          <div className="orb orb-a" aria-hidden />
          <div className="orb orb-b" aria-hidden />
          <Navbar />
          <main className="relative min-h-[72vh]">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
