'use client';

import * as React from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Wand2, RefreshCw } from 'lucide-react';

// Import the actual components
import { CharacterDetailsForm } from './CharacterDetailsForm';
import { LifeFactsManager, lifeFactsSchema } from './LifeFactsManager';
import { BackstoryEditor } from './BackstoryEditor';
import { ImageUploader, imageUploadsSchema } from './ImageUploader';
import { EnvironmentSelector } from './EnvironmentSelector';
import { useStoryGenerator } from '@/hooks/use-story-generator';
import { StoryInputType, StoryOutputType } from '@/lib/api-client';
import { StoryDisplay } from '@/components/StoryDisplay';

// Updated schema
const storyCreationSchema = z.object({
  characterName: z
    .string()
    .min(2, { message: 'Character name must be at least 2 characters long.' }),
  profession: z
    .string()
    .min(2, { message: 'Profession must be at least 2 characters long.' }),
  workplace: z
    .string()
    .min(2, { message: 'Workplace must be at least 2 characters long.' }),
  lifeFacts: lifeFactsSchema.optional(),
  backstory: z
    .string()
    .min(50, { message: 'Backstory must be at least 50 characters.' }),
  images: imageUploadsSchema.optional(),
  primarySetting: z
    .string({
      required_error: 'Please select a primary setting.',
    })
    .min(1, 'Please select a primary setting.'),
  mood: z
    .string({ required_error: 'Please select a mood.' })
    .min(1, 'Please select a mood.'),
  timePeriod: z
    .string({ required_error: 'Please select a time period.' })
    .min(1, 'Please select a time period.'),
});

export type StoryCreationFormValues = z.infer<typeof storyCreationSchema>;

interface StoryCreationFormProps {
  onStoryCreated?: (story: StoryOutputType) => void;
}

export function StoryCreationForm({ onStoryCreated }: StoryCreationFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [generatedStory, setGeneratedStory] =
    React.useState<StoryOutputType | null>(null);

  const { isGenerating, completePartialStory, createNewStory, error } =
    useStoryGenerator();

  const methods = useForm<StoryCreationFormValues>({
    resolver: zodResolver(storyCreationSchema),
    // mode: "onBlur", // Consider validation timing
    defaultValues: {
      // It's good practice to set defaultValues
      characterName: '',
      profession: '',
      workplace: '',
      lifeFacts: [{ type: '', content: '' }],
      backstory: '',
      images: [],
      primarySetting: '',
      mood: '',
      timePeriod: '',
    },
  });

  const { handleSubmit, trigger, reset, setValue, getValues, watch } = methods;

  const populateData = async () => {
    try {
      // Get current form values
      const currentValues = getValues();

      // Process the data to remove empty image slots and life facts
      const processedData: StoryInputType = {
        ...currentValues,
        images:
          currentValues.images
            ?.filter((img) => img.file && img.file.length > 0)
            .map((img) => ({
              type: img.type,
              fileName: img.file[0]?.name,
              fileSize: img.file[0]?.size,
              fileType: img.file[0]?.type,
            })) || [],
        lifeFacts:
          currentValues.lifeFacts?.filter(
            (fact) => fact.type && fact.content
          ) || [],
      };

      // Show loading toast
      toast.info('Populating story data...', {
        id: 'populating-data',
        duration: Infinity,
      });

      // Generate story based on current data
      const story = await completePartialStory(processedData);

      if (story) {
        // Update form values with the generated story
        setValue('characterName', story.characterName);
        setValue('profession', story.profession);
        setValue('workplace', story.workplace);
        setValue('backstory', story.backstory);
        setValue('primarySetting', story.primarySetting);
        setValue('mood', story.mood);
        setValue('timePeriod', story.timePeriod);

        // Set life facts, ensuring the format matches what the form expects
        setValue(
          'lifeFacts',
          story.lifeFacts.map((fact) => ({
            type: fact.type,
            content: fact.content,
          }))
        );

        // Go to the final summary step
        setCurrentStep(steps.length - 1);

        // Set generated story for the summary view
        setGeneratedStory(story);

        toast.success('Story data populated successfully!', {
          id: 'populating-data',
        });
      }
    } catch (err) {
      console.error('Error populating data:', err);
      toast.error('Failed to populate story data. Please try again.', {
        id: 'populating-data',
      });
    }
  };

  const randomizeStory = async () => {
    try {
      toast.info('Generating random story...', {
        id: 'generating-random',
        duration: Infinity,
      });

      // Call API with no data to get a completely random story
      const story = await createNewStory();

      if (story) {
        // Update form values with the generated story
        setValue('characterName', story.characterName);
        setValue('profession', story.profession);
        setValue('workplace', story.workplace);
        setValue('backstory', story.backstory);
        setValue('primarySetting', story.primarySetting);
        setValue('mood', story.mood);
        setValue('timePeriod', story.timePeriod);

        // Set life facts, ensuring the format matches what the form expects
        setValue(
          'lifeFacts',
          story.lifeFacts.map((fact) => ({
            type: fact.type,
            content: fact.content,
          }))
        );

        // Go to the final summary step
        setCurrentStep(steps.length - 1);

        // Set generated story for the summary view
        setGeneratedStory(story);

        toast.success('Random story generated!', {
          id: 'generating-random',
        });
      }
    } catch (err) {
      console.error('Error generating random story:', err);
      toast.error('Failed to generate random story. Please try again.', {
        id: 'generating-random',
      });
    }
  };

  const onSubmit: SubmitHandler<StoryCreationFormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      console.log('Raw form data:', data);

      // Process the data to remove empty image slots and life facts
      const processedData: StoryInputType = {
        ...data,
        images:
          data.images
            ?.filter((img) => img.file && img.file.length > 0)
            .map((img) => ({
              type: img.type,
              fileName: img.file[0]?.name,
              fileSize: img.file[0]?.size,
              fileType: img.file[0]?.type,
            })) || [],
        lifeFacts:
          data.lifeFacts?.filter((fact) => fact.type && fact.content) || [],
      };

      console.log('Processed Form data for submission:', processedData);

      // Call our AI service to generate or complete the story
      const storyResult = await completePartialStory(processedData);

      if (storyResult) {
        setGeneratedStory(storyResult);

        // Call the callback provided by the parent component
        if (onStoryCreated) {
          onStoryCreated(storyResult);
        }

        toast.success('Your story has been created!');
      }
    } catch (err) {
      console.error('Error during submission:', err);
      toast.error('Failed to process your story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track current values for summary step
  const formValues = watch();

  const steps = [
    {
      id: 'character',
      name: 'Character Details',
      component: <CharacterDetailsForm />,
      fields: ['characterName', 'profession', 'workplace'],
    },
    {
      id: 'lifeFacts',
      name: 'Life Facts',
      component: <LifeFactsManager />,
      fields: ['lifeFacts'],
    },
    {
      id: 'backstory',
      name: 'Backstory',
      component: <BackstoryEditor />,
      fields: ['backstory'],
    },
    {
      id: 'images',
      name: 'Image Uploads',
      component: <ImageUploader />,
      fields: ['images'],
    },
    {
      id: 'environment',
      name: 'Environment',
      component: <EnvironmentSelector />,
      fields: ['primarySetting', 'mood', 'timePeriod'],
    },
    {
      id: 'summary',
      name: 'Story Summary',
      component: generatedStory ? (
        <div className="py-4">
          <StoryDisplay
            story={generatedStory}
            showActions={true}
            onStartExperience={() => {
              // Use the onStoryCreated callback here too since it will lead to the experience page
              if (onStoryCreated) {
                onStoryCreated(generatedStory);
              }
            }}
          />
        </div>
      ) : (
        <div className="py-4">
          <h3 className="text-xl font-semibold mb-4">Review Your Story</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Character</h4>
              <p>{formValues.characterName || 'Not provided'}</p>
              <p className="text-sm text-muted-foreground">
                {formValues.profession} at {formValues.workplace}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Life Facts</h4>
              <ul className="list-disc pl-5">
                {formValues.lifeFacts
                  ?.filter((f) => f.type && f.content)
                  .map((fact, i) => (
                    <li key={i}>
                      <span className="font-medium">{fact.type}:</span>{' '}
                      {fact.content}
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Backstory</h4>
              <p className="whitespace-pre-wrap">
                {formValues.backstory || 'Not provided'}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Setting</h4>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Setting:
                  </span>{' '}
                  {formValues.primarySetting}
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Mood:</span>{' '}
                  {formValues.mood}
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Era:</span>{' '}
                  {formValues.timePeriod}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      fields: [], // Summary doesn't need validation
    },
  ];

  const nextStep = async () => {
    const currentFields = steps[currentStep]
      .fields as (keyof StoryCreationFormValues)[];
    // Trigger validation only for fields in the current step
    const isValid = await trigger(
      currentFields.length > 0 ? currentFields : undefined,
      { shouldFocus: true }
    );
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      // Optionally, provide feedback if validation fails for the current step
      toast.error(
        'Please fill in all required fields for this step correctly or ensure files are selected.'
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={populateData}
            disabled={isGenerating}
            className="flex items-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Working...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Populate Data
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={randomizeStory}
            disabled={isGenerating}
            className="flex items-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Working...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Randomize
              </>
            )}
          </Button>
        </div>

        {/* Progress Indicator (Optional but Recommended for Multi-Step) */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}
          </p>
          {/* You could add a visual progress bar here */}
        </div>

        <div className="p-1 min-h-[200px]">
          {' '}
          {/* Ensure minimum height for content area */}
          {steps[currentStep].component}
        </div>

        <Separator />

        <div className="flex justify-between pt-2">
          {currentStep > 0 ? (
            <Button type="button" onClick={prevStep} variant="outline">
              Previous
            </Button>
          ) : (
            <div /> /* Placeholder to keep Next button to the right */
          )}

          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting || isGenerating}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Story'
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
