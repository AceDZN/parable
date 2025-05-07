// API client for story generation

type StoryInputType = {
  characterName?: string;
  profession?: string;
  workplace?: string;
  lifeFacts?: Array<{
    type: string;
    content: string;
  }>;
  backstory?: string;
  images?: any[];
  primarySetting?: string;
  mood?: string;
  timePeriod?: string;
};

type StoryOutputType = {
  characterName: string;
  profession: string;
  workplace: string;
  lifeFacts: Array<{
    type: string;
    content: string;
  }>;
  backstory: string;
  primarySetting: string;
  mood: string;
  timePeriod: string;
};

/**
 * Generate a story using our Gemini integration
 * @param data Optional partial story data to complete
 * @returns Complete story data
 */
export async function generateStory(
  data?: StoryInputType
): Promise<StoryOutputType> {
  try {
    const response = await fetch('/api/story/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate story');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

// Export types for use in components
export type { StoryInputType, StoryOutputType };
