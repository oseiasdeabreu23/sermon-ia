import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'SermãoIA - Gerador de Esboços de Pregação',
  description:
    'Ferramenta completa para pastores e pregadores gerarem esboços de pregação com Inteligência Artificial',
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SermãoIA',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#2563EB" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-light-bg">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
