import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStoriesByUserId } from '@/lib/firebase-service';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all stories for the user
    const stories = await getStoriesByUserId(userId);

    return NextResponse.json({
      success: true,
      stories,
    });
  } catch (error: any) {
    console.error('Get stories error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get stories',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
