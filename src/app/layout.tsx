import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Parable',
  description: 'A platform for creating and sharing stories',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-xl font-bold tracking-tight text-foreground"
                >
                  Parable
                </Link>
                <nav className="hidden md:flex space-x-4">
                  <SignedIn>
                    <Link
                      href="/create"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      Create Story
                    </Link>
                    <Link
                      href="/stories"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      My Stories
                    </Link>
                  </SignedIn>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-sm font-medium hover:text-primary transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
