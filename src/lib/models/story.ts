import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLES } from '../db';
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { StoryOutputType } from '../api-client';

export interface IStory extends StoryOutputType {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoryInput extends StoryOutputType {
  userId: string;
  title?: string;
}

export class Story {
  /**
   * Create a new story
   */
  static async create(data: CreateStoryInput): Promise<IStory> {
    const now = new Date().toISOString();
    const id = uuidv4();

    // Generate a title if one isn't provided
    const title = data.title || `${data.characterName}'s Story`;

    const story: IStory = {
      id,
      userId: data.userId,
      title,
      characterName: data.characterName,
      profession: data.profession,
      workplace: data.workplace,
      lifeFacts: data.lifeFacts,
      backstory: data.backstory,
      primarySetting: data.primarySetting,
      mood: data.mood,
      timePeriod: data.timePeriod,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLES.STORIES,
        Item: story,
      })
    );

    return story;
  }

  /**
   * Get a story by ID
   */
  static async getById(id: string): Promise<IStory | null> {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLES.STORIES,
        Key: { id },
      })
    );

    return (response.Item as IStory) || null;
  }

  /**
   * Get all stories for a user
   */
  static async getByUserId(userId: string): Promise<IStory[]> {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLES.STORIES,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    );

    return (response.Items || []) as IStory[];
  }

  /**
   * Update a story
   */
  static async update(
    id: string,
    data: Partial<IStory>
  ): Promise<IStory | null> {
    // First get the existing story
    const existingStory = await this.getById(id);
    if (!existingStory) return null;

    // Create the update expression and attribute values
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    // For each field in the data object, add it to the update expression
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'id' || key === 'userId' || key === 'createdAt') return; // Skip immutable fields

      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;

      updateExpressionParts.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    });

    // Add the updatedAt field
    updateExpressionParts.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    // Construct the update expression
    const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    // Update the story
    await docClient.send({
      TableName: TABLES.STORIES,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    // Get the updated story
    return await this.getById(id);
  }

  /**
   * Delete a story
   */
  static async delete(id: string): Promise<boolean> {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLES.STORIES,
        Key: { id },
      })
    );

    return true;
  }
}
