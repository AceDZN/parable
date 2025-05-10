import { StoryOutputType, SavedStory } from '@/lib/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, PlayCircle, Save, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface StoryDisplayProps {
  story: StoryOutputType;
  showActions?: boolean;
  onStartExperience?: () => void;
  onSaveStory?: (title?: string) => Promise<SavedStory | null>;
  onCreateNew?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function StoryDisplay({
  story,
  showActions = false,
  onStartExperience,
  onSaveStory,
  onCreateNew,
  isSaving = false,
  isSaved = false,
}: StoryDisplayProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [storyTitle, setStoryTitle] = useState(
    `${story.characterName}'s Story`
  );

  const handleExport = () => {
    try {
      // Create a JSON string of the story
      const storyJson = JSON.stringify(story, null, 2);

      // Create a blob from the JSON
      const blob = new Blob([storyJson], { type: 'application/json' });

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${story.characterName
        .replace(/\s+/g, '-')
        .toLowerCase()}-story.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success('Story exported successfully!');
    } catch (error) {
      console.error('Error exporting story:', error);
      toast.error('Failed to export story');
    }
  };

  const handleSaveWithTitle = async () => {
    if (onSaveStory) {
      await onSaveStory(storyTitle);
      setIsDialogOpen(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{story.characterName}</CardTitle>
        <CardDescription>
          {story.profession} at {story.workplace}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Backstory</h3>
          <p className="whitespace-pre-wrap">{story.backstory}</p>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Life Facts</h3>
          <ul className="list-disc pl-5 space-y-1">
            {story.lifeFacts.map((fact, index) => (
              <li key={index}>
                <span className="font-medium">{fact.type}:</span> {fact.content}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-1">Setting</h3>
            <p>{story.primarySetting}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Mood</h3>
            <p>{story.mood}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Time Period</h3>
            <p>{story.timePeriod}</p>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex justify-between pt-4 flex-wrap gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            {onCreateNew && (
              <Button
                variant="outline"
                onClick={onCreateNew}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                New Story
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {onSaveStory && !isSaved && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    disabled={isSaving}
                    className="flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Story
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Your Story</DialogTitle>
                    <DialogDescription>
                      Give your story a title so you can easily find it later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="title">Story Title</Label>
                    <Input
                      id="title"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => setIsDialogOpen(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveWithTitle} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Story'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {isSaved && (
              <Button
                variant="secondary"
                disabled
                className="flex items-center"
              >
                <Check className="mr-2 h-4 w-4" />
                Saved
              </Button>
            )}

            <Button onClick={onStartExperience} className="flex items-center">
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Experience
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
