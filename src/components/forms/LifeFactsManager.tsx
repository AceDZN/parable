'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as z from 'zod';
import type { StoryCreationFormValues } from './StoryCreationForm'; // Import the main form type

// Define the Zod schema for a single life fact and an array of them.
// This should align with how it will be defined in the main StoryCreationForm schema.
export const lifeFactSchema = z.object({
  // id: z.string().optional(), // RHF useFieldArray provides an id, so we might not need our own unless it's from DB
  type: z.string().min(1, 'Please select a type'),
  content: z.string().min(3, 'Fact content must be at least 3 characters'),
  // Potentially add other fields like date, significance, etc.
});

export const lifeFactsSchema = z.array(lifeFactSchema);

// Make sure StoryCreationFormValues (in StoryCreationForm.tsx) includes:
// lifeFacts: lifeFactsSchema.optional(),

const factTypes = [
  { value: 'achievement', label: 'Achievement' },
  { value: 'timeline_event', label: 'Timeline Event' },
  { value: 'relationship', label: 'Relationship/Friend' },
  { value: 'milestone', label: 'Personal Milestone' },
  { value: 'quirk', label: 'Quirk/Habit' },
  { value: 'fear', label: 'Fear/Phobia' },
  { value: 'dream', label: 'Dream/Aspiration' },
];

export function LifeFactsManager() {
  // Explicitly type useFormContext with the main form's values type
  const { control } = useFormContext<StoryCreationFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lifeFacts', // This name must exist in StoryCreationFormValues
  });

  const addNewFact = () => {
    // Append with default empty values that match the lifeFactSchema
    append({ type: '', content: '' });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Life Facts</CardTitle>
        <CardDescription>
          Add significant events, relationships, achievements, or quirks that
          define your character. These will be woven into their story.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="p-4 border rounded-md space-y-4 relative bg-muted/50"
          >
            <FormField
              control={control}
              name={`lifeFacts.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fact Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fact type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {factTypes.map((factType) => (
                        <SelectItem key={factType.value} value={factType.value}>
                          {factType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`lifeFacts.${index}.content`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe the fact..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
              className="absolute top-2 right-2 h-7 w-7"
              aria-label="Remove fact"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addNewFact}>
          Add Life Fact
        </Button>
      </CardContent>
    </Card>
  );
}
