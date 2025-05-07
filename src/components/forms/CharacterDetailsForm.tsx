'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'; // Assuming you are using Shadcn's Form component
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

// Define the Zod schema for this part of the form if it's not already in the parent.
// For this example, we assume the parent StoryCreationForm handles the combined schema.
// We'd typically import the relevant part of the Zod type for props if needed.
// type CharacterDetailsFormValues = z.infer<typeof characterDetailsSchema>;

export function CharacterDetailsForm() {
  const { control } = useFormContext(); // Correctly accessing form context

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Character Details</CardTitle>
        <CardDescription>
          Define the core aspects of your protagonist. Who are they?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <FormField
          control={control}
          name="characterName" // This name must match a field in the Zod schema
          render={({ field }) => (
            <FormItem>
              <FormLabel>Character Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="E.g., Alex, The Wanderer, Unit 734"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profession</FormLabel>
              <FormControl>
                <Input
                  placeholder="E.g., Office Worker, Space Explorer, Dream Weaver"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="workplace" // Assuming workplace is also part of the schema
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workplace (Name)</FormLabel>
              <FormControl>
                <Input
                  placeholder="E.g., Cubicle #451, The Starship Chronos, The Archives of Lost Memories"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 
          Workplace Logo (image upload) will be handled by ImageUploader component later
          or a specific field here if it's simple enough.
          For now, we defer image uploads to the dedicated ImageUploader step.
        */}
      </CardContent>
    </Card>
  );
}
