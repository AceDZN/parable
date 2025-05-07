'use client';

import { useState } from 'react';
import { StoryCreationForm } from '@/components/forms/StoryCreationForm';
import { StoryDisplay } from '@/components/StoryDisplay';
import { StoryOutputType } from '@/lib/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function CreateStoryPage() {
  const [generatedStory, setGeneratedStory] = useState<StoryOutputType | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(true);
  const router = useRouter();

  const handleStoryCreated = (story: StoryOutputType) => {
    setGeneratedStory(story);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setGeneratedStory(null);
    setIsCreating(true);
  };

  const handleStartExperience = () => {
    // In a real implementation, this would navigate to the experience page with the story ID
    // For now, we'll just navigate to a dummy URL
    if (generatedStory) {
      router.push(`/experience?storyId=story_${Date.now()}`);
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
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
