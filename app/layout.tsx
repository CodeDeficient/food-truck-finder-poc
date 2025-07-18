import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import ReactPlugin from '@stagewise-plugins/react';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Food Truck Finder',
  description: 'Discover the best food trucks near you.',
  // generator: 'v0.dev', // Removed as it seems like a template placeholder
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
