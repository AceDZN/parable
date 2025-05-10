// API client for story generation and management

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

interface SavedStory extends StoryOutputType {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

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

/**
 * Save a generated story to the database
 * @param story The story to save
 * @param title Optional title for the story
 * @returns The saved story with ID and metadata
 */
export async function saveStory(
  story: StoryOutputType,
  title?: string
): Promise<SavedStory> {
  try {
    const response = await fetch('/api/story/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        story,
        title,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save story');
    }

    const result = await response.json();
    return result.story;
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
}

/**
 * Get all stories for the current user
 * @returns Array of saved stories
 */
export async function getStories(): Promise<SavedStory[]> {
  try {
    const response = await fetch('/api/story', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get stories');
    }

    const result = await response.json();
    return result.stories;
  } catch (error) {
    console.error('Error getting stories:', error);
    throw error;
  }
}

/**
 * Get a specific story by ID
 * @param id The story ID
 * @returns The story if found
 */
export async function getStory(id: string): Promise<SavedStory> {
  try {
    const response = await fetch(`/api/story/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get story');
    }

    const result = await response.json();
    return result.story;
  } catch (error) {
    console.error('Error getting story:', error);
    throw error;
  }
}

/**
 * Update a story
 * @param id The story ID
 * @param data The updated story data
 * @returns The updated story
 */
export async function updateStory(
  id: string,
  data: Partial<SavedStory>
): Promise<SavedStory> {
  try {
    const response = await fetch(`/api/story/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update story');
    }

    const result = await response.json();
    return result.story;
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
}

/**
 * Delete a story
 * @param id The story ID
 * @returns Success status
 */
export async function deleteStory(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/story/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete story');
    }

    return true;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
}

// Export types for use in components
export type { StoryInputType, StoryOutputType, SavedStory };
