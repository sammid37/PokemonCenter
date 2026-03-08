import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Centro Pokémon',
  description: 'Sistema de gerenciamento de Pokémons',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="garden">
      <body>{children}</body>
    </html>
  );
}