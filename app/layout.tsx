import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

const grotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DEXTER APIS — 275+ Production APIs',
  description: 'AI, downloaders, movies, Sri Lankan news, tools, fun and more. Free tier forever, subscriptions for power users.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${grotesk.className} min-h-screen bg-[#181818] text-zinc-100 antialiased`}>
        <ToastProvider>
          <Navbar />
          <main className="relative min-h-[72vh]">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
