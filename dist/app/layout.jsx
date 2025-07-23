import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
    title: 'Food Truck Finder',
    description: 'Discover the best food trucks near you.',
    // generator: 'v0.dev', // Removed as it seems like a template placeholder
};
export default function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>);
}
