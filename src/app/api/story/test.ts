// Client-side test script for testing the story generation API

import { generateStory, StoryInputType } from '@/lib/api-client';

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
