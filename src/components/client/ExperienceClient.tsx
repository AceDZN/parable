'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { ArrowLeft, Expand, Shrink } from 'lucide-react';
import { SavedStory } from '@/lib/api-client';
import { toast } from 'sonner';
import { ThreeJSEnvironment } from './threejs/ThreeJSEnvironment';

interface ExperienceClientProps {
  story: SavedStory | null;
  error: string | null;
}

export const ExperienceClient: React.FC<ExperienceClientProps> = ({
  story,
  error,
}) => {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement != null);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;

    if (!isFullscreen) {
      gameContainerRef.current.requestFullscreen().catch((err) => {
        toast.error('Fullscreen Error', {
          description: `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        });
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (error) {
    toast.error('Error loading story', {
      description:
        error || 'There was a problem loading your story. Please try again.',
    });
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center text-red-500">
        <p>{error}</p>
        <p>Please try again or select a different story.</p>
        <Button onClick={() => router.push('/stories')} className="mt-4">
          Go to Stories
        </Button>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center">
        <p>Loading story...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center"
          onClick={() => router.push('/stories')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to your stories
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{story.title}</h1>
        <Button
          variant="outline"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Shrink className="h-5 w-5" />
          ) : (
            <Expand className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Game Container with Aspect Ratio Control */}
      <div
        ref={gameContainerRef}
        className="w-full bg-black relative"
        style={{
          aspectRatio: isFullscreen ? undefined : '4 / 3',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : undefined,
          maxWidth: isFullscreen
            ? undefined
            : 'calc(min(100vw - 2rem, (100vh - 10rem) * 4 / 3))', // Adjust 10rem for header/padding
          margin: isFullscreen ? '0' : 'auto',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? '0' : undefined,
          left: isFullscreen ? '0' : undefined,
          zIndex: isFullscreen ? 1000 : 1,
        }}
      >
        <ThreeJSEnvironment />
      </div>

      {/* Story details can be shown below or overlaid, conditionally hidden in fullscreen? */}
      {!isFullscreen && (
        <Card className="w-full max-w-4xl mt-6">
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
            <CardDescription>Playing: {story.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Character:</span>{' '}
              {story.characterName}
            </p>
            <p>
              <span className="font-medium">Profession:</span>{' '}
              {story.profession}
            </p>
            <p>
              <span className="font-medium">Setting:</span>{' '}
              {story.primarySetting}
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
