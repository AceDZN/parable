import { NextRequest, NextResponse } from 'next/server';
import {
  generateStructuredContent,
  Type,
  defaultSafetySettings,
} from '@/utils/ai';

// Define recipe interface for type safety
interface Recipe {
  recipeName: string;
  ingredients: string[];
  preparationTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
}

// Define the schema for recipes, matching the Recipe interface
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

// For a collection of recipes
const recipesCollectionSchema = {
  type: Type.ARRAY,
  items: recipeSchema,
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format') || 'single';

  try {
    if (format === 'collection') {
      // Generate a collection of recipes
      const prompt =
        'Provide three popular cookie recipes with detailed ingredients and instructions.';

      const recipes = await generateStructuredContent<Recipe[]>(
        prompt,
        recipesCollectionSchema,
        {
          temperature: 0.7,
          maxOutputTokens: 2048,
          safetySettings: defaultSafetySettings,
        }
      );

      return NextResponse.json({
        success: true,
        message:
          'Generated recipe collection using schema-based structured output',
        data: recipes,
      });
    } else {
      // Generate a single recipe
      const prompt =
        'Provide a recipe for chocolate chip cookies with detailed ingredients and instructions.';

      // Custom safety settings - less strict for recipe generation
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

      const recipe = await generateStructuredContent<Recipe>(
        prompt,
        recipeSchema,
        {
          temperature: 0.7,
          maxOutputTokens: 1024,
          safetySettings: recipeSafetySettings,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Generated recipe using schema-based structured output',
        data: recipe,
      });
    }
  } catch (error: any) {
    console.error('Error generating structured output:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate structured output',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
