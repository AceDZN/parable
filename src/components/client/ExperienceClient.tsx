'use client';

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
import { ArrowLeft } from 'lucide-react';
import { SavedStory } from '@/lib/api-client';
import { toast } from 'sonner';

interface ExperienceClientProps {
  story: SavedStory | null;
  error: string | null;
}

export function ExperienceClient({ story, error }: ExperienceClientProps) {
  const router = useRouter();

  // Show error toast if there's an error
  if (error) {
    toast.error('Error loading story', {
      description: 'There was a problem loading your story. Please try again.',
    });
  }

  const handleBackClick = () => {
    // Navigate back to stories list
    router.push('/stories');
  };

  return (
    <>
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={handleBackClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to your stories
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Experience Your Parable
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {story ? story.title : 'Story not found'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="p-6 border rounded-md shadow-sm bg-muted/30 flex flex-col items-center justify-center min-h-[400px]">
              <p className="text-center text-red-500">{error}</p>
              <Button onClick={() => router.push('/stories')} className="mt-4">
                Go to Stories
              </Button>
            </div>
          ) : story ? (
            <div className="p-6 border rounded-md shadow-sm bg-muted/30 flex flex-col items-center justify-center min-h-[400px]">
              <h2 className="text-xl font-semibold mb-4">
                Experience Coming Soon
              </h2>
              <p className="text-center text-muted-foreground mb-4">
                This is a placeholder for the interactive narrative experience.
                <br />
                In the future, this will be a fully interactive 3D environment
                <br />
                where you can explore your generated story.
              </p>

              <div className="w-full max-w-md p-4 bg-card border rounded-md shadow-sm">
                <h3 className="font-semibold mb-2">Story Details</h3>
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
              </div>
            </div>
          ) : (
            <div className="p-6 border rounded-md shadow-sm bg-muted/30 flex flex-col items-center justify-center min-h-[400px]">
              <p className="text-center text-muted-foreground">
                Story not found. Please create a new story or select an existing
                one.
              </p>
              <Button onClick={() => router.push('/stories')} className="mt-4">
                Go to Stories
              </Button>
            </div>
          )}
        </CardContent>
        {story && (
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Created: {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
