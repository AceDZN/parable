import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createStory, CreateStoryInput } from '@/lib/firebase-service';
import { StoryOutputType } from '@/lib/api-client';

// Define the save story schema
const saveStorySchema = z.object({
  story: z.object({
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
  }),
  title: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = saveStorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { story, title } = validationResult.data;

    // Create the story in the database
    const storyData: CreateStoryInput = {
      userId,
      title,
      ...story,
    };

    const savedStory = await createStory(storyData);

    return NextResponse.json({
      success: true,
      story: savedStory,
    });
  } catch (error: any) {
    console.error('Save story error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save story',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
