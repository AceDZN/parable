export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  generateStructuredContent,
  storySchema,
  defaultSafetySettings,
} from '@/utils/ai';

// Define story data interface
interface StoryData {
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
}

// Define the story input schema for validation
const storyInputSchema = z.object({
  characterName: z.string().optional(),
  profession: z.string().optional(),
  workplace: z.string().optional(),
  lifeFacts: z
    .array(
      z.object({
        type: z.string(),
        content: z.string(),
      })
    )
    .optional(),
  backstory: z.string().optional(),
  images: z.array(z.any()).optional(),
  primarySetting: z.string().optional(),
  mood: z.string().optional(),
  timePeriod: z.string().optional(),
});

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
function createPrompt(partialStory = {}) {
  const hasData = Object.keys(partialStory).length > 0;

  if (!hasData) {
    return `Generate a complete character profile and story setting for a narrative exploration game inspired by "The Stanley Parable".
The character should be interesting with a detailed profession, workplace, and backstory. Include 3-5 life facts that define the character.
The setting, mood, and time period should create an intriguing narrative environment.
Make the backstory at least 100 words and ensure all details are cohesive.`;
  }

  // Create a prompt for partial data completion
  return `Complete the following partially defined character profile for a narrative exploration game inspired by "The Stanley Parable".
Fill in any missing details and ensure all elements work cohesively together. Make the backstory at least 100 words if you need to create one.

Provided partial profile:
${JSON.stringify(partialStory, null, 2)}

Complete all missing fields with creative, detailed, and cohesive information that would make for an engaging narrative experience.`;
}

// Set a timeout for API requests
const GENERATION_TIMEOUT = 30000; // 30 seconds

// Define custom safety settings for story generation - slightly more permissive
const storySafetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
];

// API route handler
export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('Missing GOOGLE_AI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API key configuration missing' },
        { status: 500 }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input (if any)
    let partialStory = {} as any;
    if (Object.keys(body).length > 0) {
      const validationResult = storyInputSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: 'Invalid input data',
            details: validationResult.error.format(),
          },
          { status: 400 }
        );
      }
      partialStory = validationResult.data;
    }

    // Create a prompt based on provided data
    const prompt = createPrompt(partialStory);

    // Use our utility function to generate structured content
    const temperature = 0.75;
    const startTime = performance.now();

    try {
      // Generate content with structured output
      const storyData = await generateStructuredContent<StoryData>(
        prompt,
        storySchema,
        {
          temperature,
          maxOutputTokens: 2048,
          timeout: GENERATION_TIMEOUT,
          model: 'gemini-2.0-flash',
          safetySettings: storySafetySettings, // Use custom safety settings
        }
      );

      const endTime = performance.now();
      console.log(`Generation Time taken: ${endTime - startTime} milliseconds`);

      // Validate output against expected schema
      const validationResult = storyOutputSchema.safeParse(storyData);
      if (!validationResult.success) {
        console.error(
          'Invalid story data format:',
          validationResult.error.format()
        );
        return NextResponse.json(
          {
            error: 'Generated story data is invalid',
            details: validationResult.error.format(),
          },
          { status: 500 }
        );
      }

      // Log success for monitoring
      console.log(
        'Successfully generated story for',
        storyData.characterName,
        'working as a',
        storyData.profession
      );

      return NextResponse.json(storyData);
    } catch (error: any) {
      console.error('Story generation error:', error);

      // Provide more specific error messages based on error type
      if (error.message?.includes('timed out')) {
        return NextResponse.json(
          {
            error: 'Story generation timed out',
            details: 'Please try again or use a simpler request',
          },
          { status: 504 }
        );
      }

      if (error.message?.includes('safety')) {
        return NextResponse.json(
          {
            error: 'Content filtered by safety settings',
            details: 'Please modify your request',
          },
          { status: 400 }
        );
      }

      // Generic error fallback
      return NextResponse.json(
        {
          error: 'Failed to generate story',
          details: error.message || 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// For GET requests - returning API information
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/story/generate',
    description: 'Generate a complete or partial story using Gemini AI',
    methods: ['POST'],
    parameters: {
      characterName: 'string (optional)',
      profession: 'string (optional)',
      workplace: 'string (optional)',
      lifeFacts: 'array (optional)',
      backstory: 'string (optional)',
      primarySetting: 'string (optional)',
      mood: 'string (optional)',
      timePeriod: 'string (optional)',
    },
    examples: {
      emptyRequest:
        'Send an empty object {} to generate a completely random story',
      partialRequest:
        'Send partial fields to have the AI complete the missing ones',
    },
  });
}
