'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStories, deleteStory, SavedStory } from '@/lib/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, PlusCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function StoriesPage() {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadStories() {
      try {
        const data = await getStories();
        setStories(data);
      } catch (error) {
        console.error('Error loading stories:', error);
        toast.error('Error loading stories', {
          description:
            'There was a problem loading your stories. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    }

    loadStories();
  }, []);

  const handleCreate = () => {
    router.push('/create');
  };

  const handlePlay = (storyId: string) => {
    router.push(`/experience?storyId=${storyId}`);
  };

  const handleDelete = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      setStories(stories.filter((story) => story.id !== storyId));
      toast.success('Story deleted', {
        description: 'Your story has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Error deleting story', {
        description:
          'There was a problem deleting your story. Please try again.',
      });
    }
    setStoryToDelete(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Your Stories
          </h1>
          <p className="text-muted-foreground">Loading your stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Your Stories</h1>
          <Button onClick={handleCreate} className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Story
          </Button>
        </div>

        {stories.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  You haven't created any stories yet.
                </p>
                <Button onClick={handleCreate}>Create Your First Story</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Card key={story.id}>
                <CardHeader>
                  <CardTitle>{story.title}</CardTitle>
                  <CardDescription>
                    {story.characterName} · {story.profession} at{' '}
                    {story.workplace}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2">{story.backstory}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {story.primarySetting}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                      {story.mood}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-700/10">
                      {story.timePeriod}
                    </span>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between py-3">
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(story.createdAt).toLocaleDateString()}
                  </div>
                  <div className="space-x-2">
                    <AlertDialog
                      open={storyToDelete === story.id}
                      onOpenChange={(open: boolean) => {
                        if (!open) setStoryToDelete(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStoryToDelete(story.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Story</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this story? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(story.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button onClick={() => handlePlay(story.id)} size="sm">
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
