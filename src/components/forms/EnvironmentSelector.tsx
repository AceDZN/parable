'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import type { StoryCreationFormValues } from './StoryCreationForm'; // Import the main form type
import * as z from 'zod';

// Zod schema for this section is part of the main storyCreationSchema:
// primarySetting: z.string({ required_error: "Please select a primary setting." }),
// mood: z.string({ required_error: "Please select a mood." }),
// timePeriod: z.string({ required_error: "Please select a time period." }),

// Make sure these are added to storyCreationSchema and StoryCreationFormValues
export const environmentSelectionSchema = z.object({
  primarySetting: z
    .string({ required_error: 'Please select a primary setting.' })
    .min(1, 'Please select a primary setting.'),
  mood: z
    .string({ required_error: 'Please select a mood.' })
    .min(1, 'Please select a mood.'),
  timePeriod: z
    .string({ required_error: 'Please select a time period.' })
    .min(1, 'Please select a time period.'),
});

const primarySettings = [
  { value: 'office', label: 'Office' },
  { value: 'home', label: 'Home' },
  { value: 'outdoors_nature', label: 'Outdoors - Nature' },
  { value: 'outdoors_city', label: 'Outdoors - City' },
  { value: 'fantasy_realm', label: 'Fantasy Realm' },
  { value: 'sci_fi_ship', label: 'Sci-Fi Spaceship' },
  { value: 'historical_setting', label: 'Historical Setting' },
  { value: 'surreal_dreamscape', label: 'Surreal Dreamscape' },
  { value: 'post_apocalyptic', label: 'Post-Apocalyptic' },
  { value: 'other', label: 'Other (Specify in Backstory)' },
];

const moods = [
  { value: 'serious', label: 'Serious' },
  { value: 'comedic', label: 'Comedic' },
  { value: 'philosophical', label: 'Philosophical' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'horror', label: 'Horror' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'reflective', label: 'Reflective/Introspective' },
  { value: 'uplifting', label: 'Uplifting' },
  { value: 'dark', label: 'Dark/Gritty' },
];

const timePeriods = [
  { value: 'present_day', label: 'Present Day' },
  { value: 'near_future', label: 'Near Future' },
  { value: 'far_future', label: 'Distant Future' },
  { value: 'victorian_era', label: 'Victorian Era' },
  { value: 'medieval_times', label: 'Medieval Times' },
  { value: 'ancient_history', label: 'Ancient History' },
  { value: '1980s', label: '1980s' },
  { value: '1950s', label: '1950s' },
  { value: 'timeless', label: 'Timeless/Ambiguous' },
];

export function EnvironmentSelector() {
  const { control } = useFormContext<StoryCreationFormValues>();

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Environmental Settings</CardTitle>
        <CardDescription>
          Choose the primary setting, mood, and time period for your narrative.
          These will set the stage for your character's journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <FormField
          control={control}
          name="primarySetting"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Setting</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the main environment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {primarySettings.map((setting) => (
                    <SelectItem key={setting.value} value={setting.value}>
                      {setting.label}
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
          name="mood" // This name must exist in StoryCreationFormValues
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mood / Tone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the overall mood" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.label}
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
          name="timePeriod" // This name must exist in StoryCreationFormValues
          render={({ field }) => (
            <FormItem>
              <FormLabel>Era / Time Period</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the time period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
