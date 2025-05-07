'use client';

import * as React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, UploadCloud, ImagePlus } from 'lucide-react';
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
import Image from 'next/image';
import * as z from 'zod';
import type { StoryCreationFormValues } from './StoryCreationForm';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const imageUploadSchema = z.object({
  type: z.string().min(1, 'Please select an image type'),
  file: z
    .custom<FileList>( // Using FileList initially, will refine for single file
      (val) => val instanceof FileList && val.length > 0,
      'Please select an image file'
    )
    .refine(
      (fileList) =>
        fileList && fileList[0] && fileList[0].size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (fileList) =>
        fileList &&
        fileList[0] &&
        ACCEPTED_IMAGE_TYPES.includes(fileList[0].type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  previewUrl: z.string().optional(), // For displaying image preview
  // id: z.string().optional(), // RHF useFieldArray provides an id
});

export const imageUploadsSchema = z.array(imageUploadSchema);

// Ensure StoryCreationFormValues includes:
// images: imageUploadsSchema.optional(),

const imageTypes = [
  { value: 'character_portrait', label: 'Character Portrait/Avatar' },
  { value: 'workplace_logo', label: 'Workplace Logo' },
  { value: 'location', label: 'Location Image' },
  { value: 'object', label: 'Important Object' },
  { value: 'person', label: 'Person from Life' },
  { value: 'other', label: 'Other' },
];

export function ImageUploader() {
  const { control, setValue, watch } =
    useFormContext<StoryCreationFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'images', // This name must exist in StoryCreationFormValues
  });

  const addNewImageSlot = () => {
    append({ type: '', file: new DataTransfer().files, previewUrl: '' });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      setValue(`images.${index}.file`, fileList as any, {
        shouldValidate: true,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue(`images.${index}.previewUrl`, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue(`images.${index}.file`, new DataTransfer().files, {
        shouldValidate: true,
      });
      setValue(`images.${index}.previewUrl`, '');
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Image Uploads</CardTitle>
        <CardDescription>
          Upload images to personalize your story. These might appear as
          photographs, art, or on computer screens in your narrative.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {fields.map((item, index) => {
          const previewUrl = watch(`images.${index}.previewUrl`);
          return (
            <div
              key={item.id}
              className="p-4 border rounded-md space-y-4 relative bg-muted/50"
            >
              <FormField
                control={control}
                name={`images.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select image category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {imageTypes.map((imgType) => (
                          <SelectItem key={imgType.value} value={imgType.value}>
                            {imgType.label}
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
                name={`images.${index}.file`}
                render={({
                  field: { onChange, value, ...restField },
                  fieldState,
                }) => (
                  <FormItem>
                    <FormLabel>Upload File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={(e) => handleFileChange(e, index)}
                        {...restField}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {previewUrl && (
                <div className="mt-2 w-32 h-32 relative border rounded overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 h-7 w-7"
                aria-label="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          onClick={addNewImageSlot}
          className="mt-4"
        >
          <ImagePlus className="mr-2 h-4 w-4" /> Add Image Slot
        </Button>
      </CardContent>
    </Card>
  );
}
