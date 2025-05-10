# Google Generative AI SDK Implementation Guide

## Overview

This document provides guidance on using the `@google/genai` package in our application. We've migrated from the older `@google/generative-ai` package to leverage the enhanced schema-based structured output support, providing more robust and reliable AI-generated content.

## Current Implementation

We're using the `@google/genai` package (v0.12.0) which provides:

1. Schema-based structured output support
2. Proper type safety through TypeScript
3. Reliable JSON responses without manual parsing
4. Simplified error handling

### Key Utility Functions

Our implementation leverages a dedicated utility file (`src/utils/ai.ts`) that provides:

```typescript
import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Gemini API client with the API key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' });

/**
 * Default safety settings using the correct format for @google/genai
 */
export const defaultSafetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

/**
 * Generate content with structured output using the Gemini API
 */
export async function generateStructuredContent<T>(
  prompt: string,
  responseSchema: any,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
    safetySettings?: any;
    timeout?: number;
    model?: string;
  } = {}
): Promise<T> {
  // Function implementation with proper error handling
}
```

## Safety Settings

Safety settings must be provided in the array format with specific category and threshold values:

```typescript
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];
```

Available threshold values:

- `BLOCK_NONE`
- `BLOCK_ONLY_HIGH`
- `BLOCK_MEDIUM_AND_ABOVE`
- `BLOCK_LOW_AND_ABOVE`

For more permissive content generation (like in creative narratives), you can use less restrictive settings:

```typescript
const permissiveSafetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  // Other categories...
];
```

## Schema Definition Guide

When defining schemas for the Gemini API, follow these guidelines:

1. **Schema Types**: Use the `Type` enum for defining data types:

   - `Type.STRING` - For text fields
   - `Type.INTEGER` - For whole numbers
   - `Type.NUMBER` - For decimal numbers
   - `Type.BOOLEAN` - For true/false values
   - `Type.ARRAY` - For arrays (requires `items` property)
   - `Type.OBJECT` - For nested objects (requires `properties`)

2. **Property Ordering**: Always specify `propertyOrdering` for objects to ensure consistent results:

   ```typescript
   propertyOrdering: ['title', 'content', 'elements'];
   ```

3. **Nested Structures**: Define complex nested objects recursively:

   ```typescript
   const characterSchema = {
     type: Type.OBJECT,
     properties: {
       name: { type: Type.STRING },
       attributes: {
         type: Type.OBJECT,
         properties: {
           strength: { type: Type.INTEGER },
           intelligence: { type: Type.INTEGER },
         },
         propertyOrdering: ['strength', 'intelligence'],
       },
     },
     propertyOrdering: ['name', 'attributes'],
   };
   ```

4. **Enums**: For fields with a specific set of valid values:
   ```typescript
   difficulty: {
     type: Type.STRING,
     enum: ['easy', 'medium', 'hard'],
   }
   ```

## Example Usage

### Single Object Generation

```typescript
import { generateStructuredContent, Type } from '@/utils/ai';

interface Recipe {
  recipeName: string;
  ingredients: string[];
  preparationTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
}

// Define schema
const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    preparationTime: { type: Type.INTEGER },
    difficulty: {
      type: Type.STRING,
      enum: ['easy', 'medium', 'hard'],
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  propertyOrdering: [
    'recipeName',
    'ingredients',
    'preparationTime',
    'difficulty',
    'instructions',
  ],
};

// Generate content with custom safety settings
const recipeSafetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
];

// Generate content
const recipe = await generateStructuredContent<Recipe>(
  'Provide a recipe for chocolate chip cookies with detailed ingredients and instructions.',
  recipeSchema,
  {
    temperature: 0.7,
    maxOutputTokens: 1024,
    safetySettings: recipeSafetySettings,
  }
);
```

### Collection of Objects

```typescript
const recipesCollectionSchema = {
  type: Type.ARRAY,
  items: recipeSchema,
};

const recipes = await generateStructuredContent<Recipe[]>(
  'Provide three popular cookie recipes with detailed ingredients and instructions.',
  recipesCollectionSchema,
  {
    temperature: 0.7,
    maxOutputTokens: 2048,
  }
);
```

## Error Handling

Our utility handles several types of errors:

1. **Timeout Errors**: When content generation takes too long
2. **Safety Violations**: When content is filtered by safety settings
3. **API Errors**: Any other errors from the API
4. **Undefined Response Text**: Properly handles potential undefined values

## Best Practices

1. **Define Reusable Schemas**: Keep schemas in a central location and reuse them
2. **Custom Safety Settings Per Feature**: Use different safety thresholds based on content type
3. **Type Safety**: Use TypeScript interfaces that match your schema structure
4. **Clear Prompts**: Provide clear instructions in prompts even with schemas
5. **Property Ordering**: Always include properly ordered properties for consistent results
6. **Timeout Handling**: Set appropriate timeouts for different types of content
7. **Error Handling**: Implement proper fallbacks for when the API fails

## Migration Notes

If you're still using the old `@google/generative-ai` package in some places, here's how to migrate:

1. **Update imports and initialization**:

   ```typescript
   // Before
   import { GoogleGenerativeAI } from '@google/generative-ai';
   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

   // After
   import { GoogleGenAI, Type } from '@google/genai';
   const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' });
   ```

2. **Update safety settings format**:

   ```typescript
   // Before
   const safetySettings = [
     {
       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
     },
     // More settings...
   ];

   // After
   const safetySettings = [
     {
       category: 'HARM_CATEGORY_HARASSMENT',
       threshold: 'BLOCK_MEDIUM_AND_ABOVE',
     },
     // More settings...
   ];
   ```

3. **Use structured output with schema**:

   ```typescript
   // Before (with JSON parsing from text)
   // Send request to LLM
   const result = await model.generateContent({
     contents: [{ role: 'user', parts: [{ text: prompt }] }],
     generationConfig: {
       // settings...
     },
     safetySettings,
   });
   const responseText = result.response.text();
   const data = JSON.parse(responseText);

   // After (with schema-based structured output)
   const response = await ai.models.generateContent({
     model: 'gemini-2.0-flash',
     contents: prompt,
     config: {
       // settings...
       responseMimeType: 'application/json',
       responseSchema: mySchema,
       safetySettings,
     },
   });
   const data = JSON.parse(response.text);
   ```

## Conclusion

The `@google/genai` package with schema-based structured output offers significant advantages over manual JSON parsing:

- More reliable JSON responses
- Better type safety and validation
- Cleaner code with less error handling
- Better consistency in response format
- Improved model guidance for higher quality output

By using our utility functions, you get all these benefits with simplified error handling and consistent configuration.
