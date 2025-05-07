'use server';

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { StoryInputType, StoryOutputType } from '@/lib/api-client';
import { saveStoryAction } from '@/app/actions';
import { z } from 'zod';

// Initialize the Gemini API client with the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Response cache to avoid duplicate calls for the same input
const responseCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

// Generate a cache key based on the input data
function generateCacheKey(data?: StoryInputType): string {
  return data ? JSON.stringify(data) : 'empty_request';
}

// Set a timeout for API requests
const GENERATION_TIMEOUT = 30000; // 30 seconds

// Define the expected story output schema for validation
const storyOutputSchema = z.object({
  characterName: z.string().min(2),
  profession: z.string().min(2),
  workplace: z.string().min(2),
  lifeFacts: z
    .array(
      z.object({
        type: z.string().min(1),
        content: z.string().min(3),
      })
    )
    .min(1),
  backstory: z.string().min(50),
  primarySetting: z.string().min(1),
  mood: z.string().min(1),
  timePeriod: z.string().min(1),
});

// Utility to create a prompt based on partial story data
function createPrompt(partialStory: StoryInputType = {}) {
  const hasData = Object.keys(partialStory).length > 0;

  if (!hasData) {
    return `Generate a complete character profile and story setting for a narrative exploration game inspired by "The Stanley Parable".
    The character should be interesting with a detailed profession, workplace, and backstory. Include 3-5 life facts that define the character.
    The setting, mood, and time period should create an intriguing narrative environment.
    Make the backstory at least 100 words and ensure all details are cohesive.

    Format your response as a JSON object with the following fields:
    {
      "characterName": "Character's full name",
      "profession": "Character's profession or occupation",
      "workplace": "Name of the character's workplace",
      "lifeFacts": [
        {
          "type": "Category of the life fact (achievement, relationship, fear, etc.)",
          "content": "Description of the specific life fact"
        }
      ],
      "backstory": "Detailed backstory for the character (at least 100 words)",
      "primarySetting": "Primary environmental setting for the narrative",
      "mood": "Overall mood or tone of the narrative",
      "timePeriod": "Era or time period for the narrative"
    }`;
  }

  // Create a prompt for partial data completion
  return `Complete the following partially defined character profile for a narrative exploration game inspired by "The Stanley Parable".
  Fill in any missing details and ensure all elements work cohesively together. Make the backstory at least 100 words if you need to create one.

  Provided partial profile:
  ${JSON.stringify(partialStory, null, 2)}

  Complete all missing fields with creative, detailed, and cohesive information that would make for an engaging narrative experience.

  Format your response as a JSON object with the following fields:
  {
    "characterName": "Character's full name",
    "profession": "Character's profession or occupation",
    "workplace": "Name of the character's workplace",
    "lifeFacts": [
      {
        "type": "Category of the life fact (achievement, relationship, fear, etc.)",
        "content": "Description of the specific life fact"
      }
    ],
    "backstory": "Detailed backstory for the character (at least 100 words)",
    "primarySetting": "Primary environmental setting for the narrative",
    "mood": "Overall mood or tone of the narrative",
    "timePeriod": "Era or time period for the narrative"
  }`;
}

/**
 * Wraps a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Generates a story using the Gemini API and persists it to the database
 * @param data Optional partial story data to complete
 * @returns The complete story data and its database ID
 */
export async function generateAndSaveStory(
  data?: StoryInputType,
  shouldCacheResult = true
) {
  try {
    // Check API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('API key configuration missing');
    }

    // Check cache for this input

    if (shouldCacheResult) {
      const cacheKey = generateCacheKey(data);
      const cachedResult = responseCache.get(cacheKey);
      if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
        console.log('Using cached story response');
        return cachedResult.data;
      }
    }

    // Create a prompt based on provided data
    const prompt = createPrompt(data);

    // Determine appropriate temperature
    const hasStructuredInput = data && Object.keys(data).length > 3;
    const temperature = hasStructuredInput ? 0.6 : 0.8;
    // Define safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    // Get the Gemini model with appropriate configuration
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
      safetySettings,
    });

    // Generate content with structured output and timeout
    const result = await withTimeout(
      model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
      GENERATION_TIMEOUT
    );

    // Get the response
    const response = result.response;
    const text = response.text();

    // Parse and validate the JSON response
    let storyData;
    try {
      storyData = JSON.parse(text);

      // Validate output format against expected schema
      const validationResult = storyOutputSchema.safeParse(storyData);
      if (!validationResult.success) {
        console.error(
          'Invalid story data format:',
          validationResult.error.format()
        );
        throw new Error('Generated story data is invalid');
      }
    } catch (error) {
      console.error('Failed to parse LLM response as JSON:', error);
      throw new Error('Failed to parse AI response');
    }

    // Save the story to the database
    const saveResult = await saveStoryAction(storyData);

    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save story');
    }

    // Create result with ID
    const resultWithId = {
      ...storyData,
      id: saveResult.id,
    };

    // Cache the result
    if (shouldCacheResult) {
      const cacheKey = generateCacheKey(data);
      responseCache.set(cacheKey, {
        timestamp: Date.now(),
        data: resultWithId,
      });
    }

    // Log success
    console.log(
      'Successfully generated and saved story for',
      storyData.characterName
    );

    // Return the story data with its ID
    return resultWithId;
  } catch (error: any) {
    console.error('Story generation and save error:', error);

    // Provide more specific error handling based on error type
    if (error.message?.includes('timed out')) {
      throw new Error(
        'Story generation timed out. Please try again with a simpler request.'
      );
    }

    if (error.message?.includes('safety')) {
      throw new Error(
        'Content filtered by safety settings. Please modify your request.'
      );
    }

    throw new Error(error.message || 'Failed to generate and save story');
  }
}
