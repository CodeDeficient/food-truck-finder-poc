// @ts-expect-error TS(2792): Cannot find module 'next'. Did you mean to set the... Remove this comment to see the full error message
import type { Metadata } from 'next';
// @ts-expect-error TS(2792): Cannot find module 'next/font/google'. Did you mea... Remove this comment to see the full error message
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { WebVitalsReporter } from '@/components/WebVitalsReporter';

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
          // @ts-expect-error TS(2322): Type '{ children: (ReactNode | Element)[]; attribu... Remove this comment to see the full error message
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          // @ts-expect-error TS(2786): 'WebVitalsReporter' cannot be used as a JSX compon... Remove this comment to see the full error message
          <WebVitalsReporter />
        </ThemeProvider>
      </body>
    </html>
  );
}
