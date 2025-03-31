import "./globals.css";
import TelegramInitializer from '@/components/TelegramInitializer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        backgroundColor: 'var(--tg-theme-bg-color)',
        color: 'var(--tg-theme-text-color)',
        margin: 0,
        minHeight: '100vh'
      }}>
        <TelegramInitializer />
        {children}
      </body>
    </html>
  );
} 