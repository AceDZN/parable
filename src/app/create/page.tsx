'use client';

import { useState } from 'react';
import { StoryCreationForm } from '@/components/forms/StoryCreationForm';
import { StoryDisplay } from '@/components/StoryDisplay';
import { StoryOutputType, SavedStory, saveStory } from '@/lib/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateStoryPage() {
  const [generatedStory, setGeneratedStory] = useState<StoryOutputType | null>(
    null
  );
  const [savedStory, setSavedStory] = useState<SavedStory | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleStoryCreated = (story: StoryOutputType) => {
    setGeneratedStory(story);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setGeneratedStory(null);
    setSavedStory(null);
    setIsCreating(true);
  };

  const handleSaveStory = async (title?: string) => {
    if (!generatedStory) return null;

    try {
      setIsSaving(true);
      const story = await saveStory(generatedStory, title);
      setSavedStory(story);
      toast.success('Story saved!', {
        description: 'Your story has been saved successfully.',
      });
      return story;
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Failed to save story', {
        description: 'There was an error saving your story. Please try again.',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartExperience = async () => {
    // If we have a saved story, navigate to the experience page with the story ID
    if (savedStory) {
      router.push(`/experience?storyId=${savedStory.id}`);
      return;
    }

    // If we have a generated story but it's not saved yet, save it first
    if (generatedStory) {
      try {
        setIsSaving(true);
        const story = await saveStory(generatedStory);
        if (story) {
          router.push(`/experience?storyId=${story.id}`);
        }
      } catch (error) {
        console.error('Error saving story before experience:', error);
        toast.error('Failed to save story', {
          description:
            'There was an error saving your story. Please try again.',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {isCreating ? (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Create Your Parable
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Tell us about your character and the world you want to explore.
              Every detail shapes your unique narrative.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StoryCreationForm onStoryCreated={handleStoryCreated} />
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">
                Your Parable
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Here's the story we've created based on your input. You can now
                explore it in the experience or create another story.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedStory && (
                <StoryDisplay
                  story={generatedStory}
                  showActions={true}
                  onStartExperience={handleStartExperience}
                  onSaveStory={handleSaveStory}
                  isSaving={isSaving}
                  isSaved={!!savedStory}
                  onCreateNew={handleCreateNew}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
