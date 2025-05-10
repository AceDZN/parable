import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Gemini API client with the API key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' });

// Set a timeout for API requests
const DEFAULT_GENERATION_TIMEOUT = 30000; // 30 seconds

/**
 * Wraps a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

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
 * @param prompt The text prompt to send to the model
 * @param responseSchema The schema to structure the output
 * @param options Additional options (temperature, maxOutputTokens, safetySettings, timeout)
 * @returns Parsed JSON response based on the provided schema
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
  const {
    temperature = 0.7,
    maxOutputTokens = 2048,
    safetySettings = defaultSafetySettings,
    timeout = DEFAULT_GENERATION_TIMEOUT,
    model = 'gemini-2.0-flash',
  } = options;

  try {
    const startTime = performance.now();

    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens,
          responseMimeType: 'application/json',
          responseSchema,
          safetySettings,
        },
      }),
      timeout
    );

    const endTime = performance.now();
    console.log(`Generation Time: ${endTime - startTime}ms`);

    // Handle undefined response text properly
    const responseText = response.text || '';
    return JSON.parse(responseText) as T;
  } catch (error: any) {
    console.error('Content generation error:', error);

    // Enhance error handling for specific error types
    if (error.message?.includes('timed out')) {
      throw new Error(
        'Content generation timed out. Please try again or simplify your request.'
      );
    }

    if (error.message?.includes('safety')) {
      throw new Error(
        'Content filtered by safety settings. Please modify your request.'
      );
    }

    // Re-throw the original error or a more descriptive one
    throw new Error(
      `Failed to generate content: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Generate content using streaming for real-time updates
 * @param prompt The text prompt to send to the model
 * @param responseSchema The schema to structure the output (optional)
 * @param options Additional options
 * @returns An async iterator that yields content chunks
 */
export async function* generateStreamingContent(
  prompt: string,
  responseSchema?: any,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
    safetySettings?: any;
    model?: string;
  } = {}
): AsyncGenerator<string> {
  const {
    temperature = 0.7,
    maxOutputTokens = 2048,
    safetySettings = defaultSafetySettings,
    model = 'gemini-2.0-flash',
  } = options;

  try {
    const config: any = {
      temperature,
      topK: 40,
      topP: 0.95,
      maxOutputTokens,
      safetySettings,
    };

    // Add schema if provided
    if (responseSchema) {
      config.responseMimeType = 'application/json';
      config.responseSchema = responseSchema;
    }

    const response = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config,
    });

    for await (const chunk of response) {
      // Handle undefined text properly
      yield chunk.text ?? '';
    }
  } catch (error: any) {
    console.error('Streaming content generation error:', error);
    throw new Error(
      `Failed to generate streaming content: ${
        error.message || 'Unknown error'
      }`
    );
  }
}

// Schema definitions for common response types

/**
 * Schema for a life fact in a character's profile
 */
export const lifeFact = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING },
    content: { type: Type.STRING },
  },
  propertyOrdering: ['type', 'content'],
};

/**
 * Schema for a complete character profile and story setting
 */
export const storySchema = {
  type: Type.OBJECT,
  properties: {
    characterName: { type: Type.STRING },
    profession: { type: Type.STRING },
    workplace: { type: Type.STRING },
    lifeFacts: {
      type: Type.ARRAY,
      items: lifeFact,
    },
    backstory: { type: Type.STRING },
    primarySetting: { type: Type.STRING },
    mood: { type: Type.STRING },
    timePeriod: { type: Type.STRING },
  },
  propertyOrdering: [
    'characterName',
    'profession',
    'workplace',
    'lifeFacts',
    'backstory',
    'primarySetting',
    'mood',
    'timePeriod',
  ],
};

export { Type };
