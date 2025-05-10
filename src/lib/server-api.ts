/**
 * Server-side API functions that can be imported in server components
 */
import { getStoryById, getStoriesByUserId, IStory } from './firebase-service';
import { SavedStory } from './api-client';

/**
 * Convert IStory to SavedStory
 */
function convertToSavedStory(story: IStory): SavedStory {
  // IStory already has timestamps converted to ISO strings by the serializeStory function
  return {
    id: story.id,
    userId: story.userId,
    title: story.title,
    characterName: story.characterName,
    profession: story.profession,
    workplace: story.workplace,
    lifeFacts: story.lifeFacts,
    backstory: story.backstory,
    primarySetting: story.primarySetting,
    mood: story.mood,
    timePeriod: story.timePeriod,
    createdAt: story.createdAt as unknown as string,
    updatedAt: story.updatedAt as unknown as string,
  };
}

/**
 * Get a specific story by ID (server-side)
 * @param id The story ID
 * @returns The story if found
 */
export async function getStory(id: string): Promise<SavedStory> {
  const story = await getStoryById(id);

  if (!story) {
    throw new Error(`Story not found with ID: ${id}`);
  }

  return convertToSavedStory(story);
}

/**
 * Get all stories for a user (server-side)
 * @param userId The user ID
 * @returns Array of saved stories
 */
export async function getStories(userId: string): Promise<SavedStory[]> {
  const stories = await getStoriesByUserId(userId);
  return stories.map(convertToSavedStory);
}
