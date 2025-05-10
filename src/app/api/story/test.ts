// Client-side test script for testing the story generation API

import { generateStory, StoryInputType } from '@/lib/api-client';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

async function testStoryGenerator() {
  console.log('Testing story generator API...');

  try {
    // Test 1: Generate a completely new story
    console.log('\n--- Test 1: Generate a new story ---');
    const newStory = await generateStory();
    console.log('Generated story:', newStory);

    // Test 2: Complete a partial story
    console.log('\n--- Test 2: Complete a partial story ---');
    const partialData: StoryInputType = {
      characterName: 'Alex Smith',
      profession: 'Software Engineer',
      lifeFacts: [
        { type: 'achievement', content: 'Developed a revolutionary AI system' },
      ],
    };
    const completedStory = await generateStory(partialData);
    console.log('Completed story:', completedStory);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// To run this test, call testStoryGenerator() from a client component
// For example, you can add a button to trigger this in development mode
export { testStoryGenerator };

export async function GET(request: NextRequest) {
  try {
    // Attempt to connect to Firebase and retrieve data
    const storiesCollection = collection(db, 'stories');
    const snapshot = await getDocs(query(storiesCollection, limit(1)));

    return NextResponse.json({
      success: true,
      connected: true,
      documentsCount: snapshot.size,
      message: 'Firebase connection successful',
    });
  } catch (error: any) {
    console.error('Firebase connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
