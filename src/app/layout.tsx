
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paroara | Restaurante | Beer Drik’s',
  description: 'Rusticidade Amazônica Premium em Belém. Sabor da Amazônia servido com tradição.',
  openGraph: {
    title: 'Paroara - O Restaurante Marajoara',
    description: 'Sabor da Amazônia servido com tradição.',
    images: ['https://picsum.photos/seed/paroara-og/1200/630'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
