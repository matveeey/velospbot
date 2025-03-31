'use client'

import "./globals.css";
import TelegramStyles from './TelegramStyles';

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
      <body>
        <TelegramStyles />
        {children}
      </body>
    </html>
  );
}