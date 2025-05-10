import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

// Initialize the DynamoDB client
const clientConfig: any = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// Add endpoint configuration for local development
if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

const client = new DynamoDBClient(clientConfig);

// Create a document client for easier interaction with DynamoDB
const docClient = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  STORIES: process.env.DYNAMODB_STORIES_TABLE || 'parable-stories',
};

// Export the document client for use in other modules
export { docClient };
