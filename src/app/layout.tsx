import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloProvider } from '@/components/ApolloProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Case Law Access Project',
  description:
    'A comprehensive database of case law with advanced search and analysis capabilities',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-greycliff text-lg`}>
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
