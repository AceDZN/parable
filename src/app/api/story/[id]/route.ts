import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStoryById, updateStory, deleteStory } from '@/lib/firebase-service';
import { z } from 'zod';

// Define the update story schema
const updateStorySchema = z.object({
  title: z.string().min(1).optional(),
  characterName: z.string().min(2).optional(),
  profession: z.string().min(2).optional(),
  workplace: z.string().min(2).optional(),
  lifeFacts: z
    .array(
      z.object({
        type: z.string().min(1),
        content: z.string().min(3),
      })
    )
    .min(1)
    .optional(),
  backstory: z.string().min(50).optional(),
  primarySetting: z.string().min(1).optional(),
  mood: z.string().min(1).optional(),
  timePeriod: z.string().min(1).optional(),
});

// GET a specific story
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Get the story
    const story = await getStoryById(id);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check if the story belongs to the user
    if (story.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      story,
    });
  } catch (error: any) {
    console.error('Get story error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get story',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// UPDATE a specific story
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Get the story to check ownership
    const existingStory = await getStoryById(id);
    if (!existingStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check if the story belongs to the user
    if (existingStory.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
    const validationResult = updateStorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Update the story
    const updatedStory = await updateStory(id, validationResult.data);

    return NextResponse.json({
      success: true,
      story: updatedStory,
    });
  } catch (error: any) {
    console.error('Update story error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update story',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE a specific story
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Get the story to check ownership
    const existingStory = await getStoryById(id);
    if (!existingStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check if the story belongs to the user
    if (existingStory.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the story
    await deleteStory(id);

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete story error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete story',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
