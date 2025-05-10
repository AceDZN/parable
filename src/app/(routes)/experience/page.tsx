import { ExperienceClient } from '@/components/client/ExperienceClient';
import { SavedStory } from '@/lib/api-client';
import { getStory } from '@/lib/server-api';
import { redirect } from 'next/navigation';

interface ExperiencePageProps {
  searchParams: {
    storyId?: string;
  };
}

export default async function ExperiencePage({
  searchParams,
}: ExperiencePageProps) {
  const storyId = searchParams.storyId;

  if (!storyId) {
    redirect('/stories');
  }

  let story: SavedStory | null = null;
  let error: string | null = null;

  try {
    story = await getStory(storyId);
  } catch (err) {
    error =
      'Failed to load story. It may not exist or you may not have access to it.';
    console.error('Error loading story:', err);
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ExperienceClient story={story} error={error} />
      </div>
    </div>
  );
}
