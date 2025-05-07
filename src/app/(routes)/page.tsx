import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link'; // Added for the button/link
import { Button } from '@/components/ui/button'; // Assuming you'll have a Button component

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">Parable</h1>
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl">Welcome, {user.firstName || user.username}!</p>
          <Link href="/create" passHref>
            <Button>Create New Story</Button>
          </Link>
        </div>
      ) : (
        <p className="text-xl">Welcome! Please sign in to create your story.</p> // Or your sign-in component here
      )}
      <footer className="text-center">
        <p className="text-sm text-gray-500">Inspired by The Stanley Parable</p>
      </footer>
    </div>
  );
}
