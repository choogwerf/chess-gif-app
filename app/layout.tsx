import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: '3D Chess GIF',
  description: 'A colourful 3D chessboard with GIF pieces',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
