import { useState } from 'react';
import {
  generateStory,
  StoryInputType,
  StoryOutputType,
} from '@/lib/api-client';
import { toast } from 'sonner';

export function useStoryGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<StoryOutputType | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Function to generate a story
  const generateStoryData = async (
    data?: StoryInputType
  ): Promise<StoryOutputType | null> => {
    try {
      setIsGenerating(true);
      setError(null);

      toast.info('Generating your story...', {
        id: 'generating-story',
        duration: Infinity,
      });

      const result = await generateStory(data);

      setGeneratedStory(result);

      toast.success('Story generated successfully!', {
        id: 'generating-story',
      });

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate story';
      setError(errorMessage);

      toast.error(errorMessage, {
        id: 'generating-story',
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to complete a partial story
  const completePartialStory = async (
    partialData: StoryInputType
  ): Promise<StoryOutputType | null> => {
    return generateStoryData(partialData);
  };

  // Function to generate a completely new story
  const createNewStory = async (): Promise<StoryOutputType | null> => {
    return generateStoryData();
  };

  return {
    isGenerating,
    generatedStory,
    error,
    completePartialStory,
    createNewStory,
  };
}
