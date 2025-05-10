import { db, storage } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { StoryOutputType } from './api-client';

// Collection name
const STORIES_COLLECTION = 'stories';

export interface IStory extends StoryOutputType {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateStoryInput extends StoryOutputType {
  userId: string;
  title?: string;
}

/**
 * Convert Firestore timestamps to ISO strings for client consumption
 */
const serializeStory = (story: any): any => {
  return {
    ...story,
    createdAt: story.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: story.updatedAt?.toDate?.()?.toISOString() || null,
  };
};

/**
 * Create a new story
 */
export async function createStory(data: CreateStoryInput): Promise<IStory> {
  // Generate a title if one isn't provided
  const title = data.title || `${data.characterName}'s Story`;

  const docRef = await addDoc(collection(db, STORIES_COLLECTION), {
    userId: data.userId,
    title,
    characterName: data.characterName,
    profession: data.profession,
    workplace: data.workplace,
    lifeFacts: data.lifeFacts,
    backstory: data.backstory,
    primarySetting: data.primarySetting,
    mood: data.mood,
    timePeriod: data.timePeriod,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Get the document to return it with the generated server timestamp
  const storySnap = await getDoc(docRef);

  if (!storySnap.exists()) {
    throw new Error('Failed to create story');
  }

  return serializeStory({ id: storySnap.id, ...storySnap.data() });
}

/**
 * Get a story by ID
 */
export async function getStoryById(id: string): Promise<IStory | null> {
  const storySnap = await getDoc(doc(db, STORIES_COLLECTION, id));

  if (!storySnap.exists()) {
    return null;
  }

  return serializeStory({ id: storySnap.id, ...storySnap.data() });
}

/**
 * Get all stories for a user
 */
export async function getStoriesByUserId(userId: string): Promise<IStory[]> {
  const storiesQuery = query(
    collection(db, STORIES_COLLECTION),
    where('userId', '==', userId)
  );

  const storiesSnap = await getDocs(storiesQuery);

  const stories = storiesSnap.docs.map((doc) =>
    serializeStory({
      id: doc.id,
      ...doc.data(),
    })
  );

  return stories;
}

/**
 * Update a story
 */
export async function updateStory(
  id: string,
  data: Partial<IStory>
): Promise<IStory | null> {
  const storyRef = doc(db, STORIES_COLLECTION, id);

  // Check if story exists
  const storySnap = await getDoc(storyRef);
  if (!storySnap.exists()) {
    return null;
  }

  // Prepare update data (remove fields that shouldn't be updated)
  const updateData: any = { ...data };
  delete updateData.id;
  delete updateData.userId;
  delete updateData.createdAt;

  // Add timestamp
  updateData.updatedAt = serverTimestamp();

  // Update the story
  await updateDoc(storyRef, updateData);

  // Get the updated story
  const updatedStorySnap = await getDoc(storyRef);

  if (!updatedStorySnap.exists()) {
    return null;
  }

  return serializeStory({
    id: updatedStorySnap.id,
    ...updatedStorySnap.data(),
  });
}

/**
 * Delete a story
 */
export async function deleteStory(id: string): Promise<boolean> {
  await deleteDoc(doc(db, STORIES_COLLECTION, id));
  return true;
}

/**
 * Upload an image to Firebase Storage
 */
export async function uploadImage(
  image: string,
  userId: string,
  type: 'avatar' | 'setting' | 'object' = 'object'
): Promise<string> {
  // Remove data URL prefix if present
  const base64Content = image.includes('base64,')
    ? image.split('base64,')[1]
    : image;

  // Create unique file path
  const path = `users/${userId}/${type}/${uuidv4()}`;
  const storageRef = ref(storage, path);

  // Upload the image
  await uploadString(storageRef, base64Content, 'base64');

  // Get the download URL
  const downloadUrl = await getDownloadURL(storageRef);

  return downloadUrl;
}
