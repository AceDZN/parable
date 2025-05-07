import { StoryOutputType } from '@/lib/api-client';
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
import { Download, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StoryDisplayProps {
  story: StoryOutputType;
  showActions?: boolean;
  onStartExperience?: () => void;
}

export function StoryDisplay({
  story,
  showActions = false,
  onStartExperience,
}: StoryDisplayProps) {
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
        <CardFooter className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Story
          </Button>

          <Button onClick={onStartExperience} className="flex items-center">
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Experience
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
