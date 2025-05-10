# Schema-Based Structured Output API Example

This example demonstrates how to use the Google Gen AI SDK (`@google/genai`) with schema-based structured output for generating consistently formatted JSON responses.

## Overview

The API uses the Gemini 2.0 model with schema-based structured output to ensure consistent JSON responses without having to manually parse the output or include formatting instructions in the prompt.

## How It Works

1. Define a TypeScript interface for the expected response structure
2. Create a matching schema using the `Type` enum from `@google/genai`
3. Pass the schema to the `generateStructuredContent` utility
4. Get back a properly typed and formatted JSON response

## Endpoints

### `GET /api/examples/structured-output`

Generates a single recipe using schema-based structured output.

**Query Parameters:**

- `format` (optional): Set to `collection` to get multiple recipes, default is `single`

**Response Format:**

```json
{
  "success": true,
  "message": "Generated recipe using schema-based structured output",
  "data": {
    "recipeName": "Classic Chocolate Chip Cookies",
    "ingredients": [
      "2 1/4 cups all-purpose flour",
      "1 teaspoon baking soda",
      "1 teaspoon salt",
      "1 cup (2 sticks) unsalted butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup packed brown sugar",
      "2 large eggs",
      "2 teaspoons vanilla extract",
      "2 cups semi-sweet chocolate chips"
    ],
    "preparationTime": 30,
    "difficulty": "easy",
    "instructions": [
      "Preheat oven to 375°F (190°C).",
      "In a small bowl, mix flour, baking soda, and salt.",
      "In a large bowl, cream butter and sugars until light and fluffy.",
      "Beat in eggs one at a time, then stir in vanilla.",
      "Gradually blend in the dry ingredients.",
      "Stir in chocolate chips.",
      "Drop by rounded tablespoons onto ungreased baking sheets.",
      "Bake for 9 to 11 minutes or until golden brown.",
      "Let stand on baking sheet for 2 minutes, then remove to cool on wire racks."
    ]
  }
}
```

## Schema Definition

The schema is defined using the `Type` enum from `@google/genai`:

```typescript
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
```

## Implementation Notes

1. The `propertyOrdering` field is important for consistent results
2. For arrays of objects, define the schema recursively
3. The TypeScript interface ensures type safety when using the response
4. No need to include JSON formatting instructions in the prompt

## Try It Out

Make a GET request to `/api/examples/structured-output?format=single` or `/api/examples/structured-output?format=collection` to see the API in action.
