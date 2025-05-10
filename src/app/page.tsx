'use client';

import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, PlayCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Your Story, Your Choices
        </h1>
        <p className="text-xl text-muted-foreground">
          Create personalized narrative adventures with AI. Share your details,
          get a unique story that reflects your character, and explore different
          paths and endings.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <SignedIn>
            <Button
              size="lg"
              onClick={() => router.push('/create')}
              className="flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Story
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/stories')}
              className="flex items-center"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              My Stories
            </Button>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="flex items-center">
                <PlayCircle className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>

      <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center rounded-md bg-primary/10 p-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Personalized Stories</h2>
          <p className="text-muted-foreground">
            Input your character details, workplace, and life experiences to
            generate a unique narrative adventure tailored specifically to you.
          </p>
        </div>
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center rounded-md bg-primary/10 p-4">
            <PlayCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Interactive Experience</h2>
          <p className="text-muted-foreground">
            Explore your narrative in an immersive environment where your
            choices matter and impact the story's direction and outcome.
          </p>
        </div>
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center rounded-md bg-primary/10 p-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Unlimited Possibilities</h2>
          <p className="text-muted-foreground">
            Create multiple stories with different characters and settings to
            explore various narrative paths and alternative life scenarios.
          </p>
        </div>
      </div>

      <div className="mt-24 text-center">
        <p className="text-sm text-muted-foreground">
          Inspired by "The Stanley Parable" — A project by Parable Team
        </p>
      </div>
    </div>
  );
}
