'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import type { StoryCreationFormValues } from './StoryCreationForm'; // Import the main form type

// The Zod schema for backstory is part of the main storyCreationSchema
// backstory: z.string().min(50, { message: "Backstory must be at least 50 characters." })

export function BackstoryEditor() {
  const { control } = useFormContext<StoryCreationFormValues>();

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Character Backstory</CardTitle>
        <CardDescription>
          Provide a free-form backstory for your character. What are their
          origins, pivotal moments, or driving motivations? The more detail, the
          richer the narrative.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <FormField
          control={control}
          name="backstory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backstory</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Once upon a time, in a land of endless code..."
                  className="min-h-[200px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
