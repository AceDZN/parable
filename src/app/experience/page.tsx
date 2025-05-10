'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getStory, SavedStory } from '@/lib/api-client';
import { toast } from 'sonner';

export default function ExperiencePage() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get('storyId');
  const router = useRouter();
  const [story, setStory] = useState<SavedStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStory() {
      if (!storyId) {
        setError('No story ID provided');
        setLoading(false);
        return;
      }

      try {
        const storyData = await getStory(storyId);
        setStory(storyData);
      } catch (err) {
        console.error('Error loading story:', err);
        setError(
          'Failed to load story. It may not exist or you may not have access to it.'
        );
        toast.error('Error loading story', {
          description:
            'There was a problem loading your story. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    }

    loadStory();
  }, [storyId]);

  const handleBackClick = () => {
    // Navigate back to stories list instead of create page
    router.push('/stories');
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
              {loading
                ? 'Loading story...'
                : story
                ? story.title
                : 'Story not found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="p-6 border rounded-md shadow-sm bg-muted/30 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-muted-foreground">Loading your story...</p>
              </div>
            ) : error ? (
              <div className="p-6 border rounded-md shadow-sm bg-muted/30 flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-center text-red-500">{error}</p>
                <Button
                  onClick={() => router.push('/stories')}
                  className="mt-4"
                >
                  Go to Stories
                </Button>
              </div>
            ) : story ? (
              <div className="p-6 border rounded-md shadow-sm bg-muted/30 flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-xl font-semibold mb-4">
                  Experience Coming Soon
                </h2>
                <p className="text-center text-muted-foreground mb-4">
                  This is a placeholder for the interactive narrative
                  experience.
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
                  Story not found. Please create a new story or select an
                  existing one.
                </p>
                <Button
                  onClick={() => router.push('/stories')}
                  className="mt-4"
                >
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
      </div>
    </div>
  );
}
