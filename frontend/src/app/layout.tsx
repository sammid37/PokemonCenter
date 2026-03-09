import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import './globals.css';
import Footer from '@/components/ui/Footer';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PokéCenter',
  description: 'Sistema de gerenciamento de Pokémons',
  icons: {
    icon: 'pokecenter_icon.ico',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={lato.variable}>
      <body className="font-lato flex flex-col min-h-screen">
        {children}
        <Footer />
      </body>
    </html>
  );
}