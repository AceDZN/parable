'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ExperiencePage() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get('storyId');
  const router = useRouter();

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 flex items-center"
          onClick={() => router.push('/create')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to story creation
        </Button>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Experience Your Parable
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Story ID: {storyId || 'No story ID provided'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 border rounded-md shadow-sm bg-muted/30 flex flex-col items-center justify-center min-h-[400px]">
              <h2 className="text-xl font-semibold mb-4">
                Experience Coming Soon
              </h2>
              <p className="text-center text-muted-foreground">
                This is a placeholder for the interactive narrative experience.
                <br />
                In the future, this will be a fully interactive 3D environment
                <br />
                where you can explore your generated story.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
