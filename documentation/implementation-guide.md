# Dynamic Narrative Game - Technical Implementation Guide

## 1. Core State Management

The foundation of our dynamic narrative game is a robust state management system that tracks player choices, narrative progression, and environmental conditions. Let's implement the core data structures and state management components.

### 1.1 State Interfaces

First, let's define the TypeScript interfaces for our core state objects:

```typescript
// src/types/state.ts

/**
 * The complete narrative state encompassing all aspects of the story experience
 */
export interface NarrativeState {
  // Core identifiers
  storyId: string;
  userId: string;

  // Meta information
  title: string;
  createdAt: string;
  lastPlayedAt: string;
  playTime: number;

  // Progress tracking
  currentBranch: string;
  currentLocation: string;
  currentSegment: string;
  completionPercentage: number;

  // Narrative elements
  narratorRelationship: NarratorRelationship;
  discoveredLocations: string[];
  discoveredContent: string[];

  // Choice tracking
  choices: Choice[];
  branchHistory: string[];

  // Environment state
  environmentModifications: EnvironmentModification[];
  objectStates: Record<string, ObjectState>;

  // User elements
  personalReferences: PersonalReference[];

  // Ending information
  endingType: string | null;
  endingSummary: string | null;
}

/**
 * Tracks the relationship between the narrator and the player
 */
export interface NarratorRelationship {
  // Overall attitude toward player
  attitude:
    | 'helpful'
    | 'neutral'
    | 'antagonistic'
    | 'confused'
    | 'philosophical';

  // Metrics tracking
  complianceScore: number; // -100 to 100 (negative is defiance)
  trustLevel: number; // 0 to 100

  // Personality development
  personalityTraits: string[];
  knowledgeOfPlayer: number; // 0 to 100 (familiarity with personal details)
}

/**
 * Represents a single player choice
 */
export interface Choice {
  id: string;
  timestamp: number;
  location: string;
  optionSelected: string;
  narratorResponse: string;

  // Impact on story
  branchImpact: {
    branch: string;
    strengthOfImpact: number; // 1-5
  };

  // Impact on narrator relationship
  relationshipImpact: {
    type: 'increase' | 'decrease' | 'none';
    amount: number;
  };
}

/**
 * Represents a change to the 3D environment
 */
export interface EnvironmentModification {
  id: string;
  location: string;
  objectId: string;
  modificationType:
    | 'appearance'
    | 'position'
    | 'visibility'
    | 'state'
    | 'content';
  modification: any; // Type depends on modificationType
  trigger: string; // What action/event triggers this modification
  triggered: boolean; // Whether this modification has been applied
  timestamp: number | null; // When it was triggered, null if not yet triggered
}

/**
 * Tracks the state of an interactive object in the environment
 */
export interface ObjectState {
  currentState: string; // e.g., "on", "off", "open", "locked"
  interactionCount: number; // How many times player has interacted with this object
  availableInteractions: string[]; // What the player can do with this object
  contents: string[] | null; // For container objects
  personalContentId: string | null; // ID of user content integrated into this object
}

/**
 * Tracks usage of personal information in the narrative
 */
export interface PersonalReference {
  personalElementId: string; // ID of the personal element referenced
  elementType:
    | 'name'
    | 'profession'
    | 'workplace'
    | 'lifeFact'
    | 'backstory'
    | 'image';
  referencedAt: number; // Timestamp
  referenceContext: string; // Where/how it was used
  location: string; // Where in the environment it appeared
  referenceType: 'explicit' | 'implicit' | 'environmental'; // How directly it was referenced
  playerReaction: 'positive' | 'negative' | 'neutral' | null; // Player's response if measurable
}
```

### 1.2 State Manager Implementation

Now, let's implement the StateManager class that will handle all aspects of state management:

```typescript
// src/services/StateManager.ts

import {
  NarrativeState,
  Choice,
  EnvironmentModification,
  ObjectState,
} from '../types/state';
import { DynamoDBService } from './DynamoDBService';
import { getCacheKey, getFromCache, setInCache } from '../utils/cacheUtils';

export class StateManager {
  private state: NarrativeState | null = null;
  private dbService: DynamoDBService;
  private dirty: boolean = false;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(private storyId: string, private userId: string) {
    this.dbService = new DynamoDBService();
  }

  /**
   * Loads the state from the database or initializes a new one
   */
  async loadState(): Promise<NarrativeState> {
    // Try to get from cache first for performance
    const cacheKey = getCacheKey(`narrative_state:${this.storyId}`);
    const cachedState = await getFromCache<NarrativeState>(cacheKey);

    if (cachedState) {
      this.state = cachedState;
      return this.state;
    }

    // Not in cache, try to load from database
    try {
      const loadedState = await this.dbService.getItem('NarrativeStates', {
        storyId: this.storyId,
        userId: this.userId,
      });

      if (loadedState) {
        this.state = loadedState as NarrativeState;
        // Cache for future quick access
        await setInCache(cacheKey, this.state, 3600); // Cache for 1 hour
        return this.state;
      }
    } catch (error) {
      console.error('Error loading state:', error);
      // Continue to create new state if load fails
    }

    // No existing state, initialize a new one
    return this.initializeNewState();
  }

  /**
   * Creates a new narrative state with default values
   */
  private async initializeNewState(): Promise<NarrativeState> {
    const now = new Date().toISOString();

    this.state = {
      storyId: this.storyId,
      userId: this.userId,

      title: 'Untitled Story',
      createdAt: now,
      lastPlayedAt: now,
      playTime: 0,

      currentBranch: 'introduction',
      currentLocation: 'office_starting_point',
      currentSegment: 'introduction_segment_1',
      completionPercentage: 0,

      narratorRelationship: {
        attitude: 'neutral',
        complianceScore: 0,
        trustLevel: 50,
        personalityTraits: ['observant', 'slightly_sardonic', 'knowledgeable'],
        knowledgeOfPlayer: 0,
      },

      discoveredLocations: ['office_starting_point'],
      discoveredContent: [],

      choices: [],
      branchHistory: ['introduction'],

      environmentModifications: [],
      objectStates: {},

      personalReferences: [],

      endingType: null,
      endingSummary: null,
    };

    // Save the new state to the database
    await this.saveState(true);

    return this.state;
  }

  /**
   * Saves the current state to the database
   * @param immediate Whether to save immediately or use the debounce timer
   */
  async saveState(immediate: boolean = false): Promise<void> {
    if (!this.state) {
      throw new Error('Cannot save null state');
    }

    // Update last played timestamp
    this.state.lastPlayedAt = new Date().toISOString();

    if (immediate) {
      try {
        await this.dbService.putItem('NarrativeStates', this.state);

        // Update cache
        const cacheKey = getCacheKey(`narrative_state:${this.storyId}`);
        await setInCache(cacheKey, this.state, 3600);

        this.dirty = false;

        // Clear any pending save timer
        if (this.saveTimer) {
          clearTimeout(this.saveTimer);
          this.saveTimer = null;
        }
      } catch (error) {
        console.error('Error saving state:', error);
        throw error;
      }
    } else {
      // Mark as dirty and schedule a save
      this.dirty = true;

      // Debounce saves to prevent too many database writes
      if (!this.saveTimer) {
        this.saveTimer = setTimeout(async () => {
          if (this.dirty) {
            await this.saveState(true);
          }
          this.saveTimer = null;
        }, 5000); // Save after 5 seconds of inactivity
      }
    }
  }

  /**
   * Records a player choice
   */
  async recordChoice(
    choice: Omit<Choice, 'id' | 'timestamp'>
  ): Promise<Choice> {
    if (!this.state) {
      await this.loadState();
    }

    const now = Date.now();
    const newChoice: Choice = {
      ...choice,
      id: `choice_${now}_${Math.floor(Math.random() * 1000)}`,
      timestamp: now,
    };

    // Add to choices array
    this.state!.choices.push(newChoice);

    // Update narrator relationship based on choice impact
    this.updateNarratorRelationship(newChoice.relationshipImpact);

    // Update branch affinity if this choice affects it significantly
    if (newChoice.branchImpact.strengthOfImpact >= 3) {
      this.updateCurrentBranch(newChoice.branchImpact.branch);
    }

    // Save the updated state
    await this.saveState();

    return newChoice;
  }

  /**
   * Updates the narrator relationship based on a choice impact
   */
  private updateNarratorRelationship(
    impact: Choice['relationshipImpact']
  ): void {
    if (!this.state) return;

    const relationship = this.state.narratorRelationship;

    // Update compliance score
    if (impact.type === 'increase') {
      relationship.complianceScore += impact.amount;
      // Small increase in trust when following narrator
      relationship.trustLevel = Math.min(
        100,
        relationship.trustLevel + impact.amount * 0.5
      );
    } else if (impact.type === 'decrease') {
      relationship.complianceScore -= impact.amount;
      // Trust decreases more quickly with defiance
      relationship.trustLevel = Math.max(
        0,
        relationship.trustLevel - impact.amount
      );
    }

    // Cap values
    relationship.complianceScore = Math.max(
      -100,
      Math.min(100, relationship.complianceScore)
    );

    // Update attitude based on compliance score
    if (relationship.complianceScore >= 70) {
      relationship.attitude = 'helpful';
    } else if (relationship.complianceScore <= -70) {
      relationship.attitude = 'antagonistic';
    } else if (relationship.complianceScore >= 30) {
      relationship.attitude = 'neutral';
    } else if (relationship.complianceScore <= -30) {
      relationship.attitude = 'philosophical';
    } else {
      relationship.attitude = 'neutral';
    }
  }

  /**
   * Updates the current branch and records it in history
   */
  updateCurrentBranch(branchId: string): void {
    if (!this.state) return;

    // Only add to history if actually changing branches
    if (this.state.currentBranch !== branchId) {
      this.state.currentBranch = branchId;
      this.state.branchHistory.push(branchId);
      this.dirty = true;
    }
  }

  /**
   * Updates the player's current location
   */
  async updateLocation(locationId: string): Promise<void> {
    if (!this.state) {
      await this.loadState();
    }

    this.state!.currentLocation = locationId;

    // Add to discovered locations if not already there
    if (!this.state!.discoveredLocations.includes(locationId)) {
      this.state!.discoveredLocations.push(locationId);
    }

    await this.saveState();
  }

  /**
   * Records a reference to personal content in the narrative
   */
  async recordPersonalReference(
    reference: Omit<PersonalReference, 'referencedAt'>
  ): Promise<void> {
    if (!this.state) {
      await this.loadState();
    }

    const newReference: PersonalReference = {
      ...reference,
      referencedAt: Date.now(),
    };

    this.state!.personalReferences.push(newReference);

    // Update narrator knowledge of player based on references made
    // More references = more familiarity
    const relationship = this.state!.narratorRelationship;
    relationship.knowledgeOfPlayer = Math.min(
      100,
      Math.floor((this.state!.personalReferences.length / 25) * 100)
    );

    await this.saveState();
  }

  /**
   * Updates an object's state in the environment
   */
  async updateObjectState(
    objectId: string,
    stateUpdates: Partial<ObjectState>
  ): Promise<ObjectState> {
    if (!this.state) {
      await this.loadState();
    }

    // Get existing state or create default
    let objectState = this.state!.objectStates[objectId] || {
      currentState: 'default',
      interactionCount: 0,
      availableInteractions: [],
      contents: null,
      personalContentId: null,
    };

    // Update with new values
    objectState = {
      ...objectState,
      ...stateUpdates,
      interactionCount: objectState.interactionCount + 1,
    };

    // Store updated state
    this.state!.objectStates[objectId] = objectState;

    await this.saveState();

    return objectState;
  }

  /**
   * Applies an environment modification
   */
  async applyEnvironmentModification(
    modification: Omit<
      EnvironmentModification,
      'id' | 'triggered' | 'timestamp'
    >
  ): Promise<EnvironmentModification> {
    if (!this.state) {
      await this.loadState();
    }

    const now = Date.now();
    const mod: EnvironmentModification = {
      ...modification,
      id: `mod_${now}_${Math.floor(Math.random() * 1000)}`,
      triggered: true,
      timestamp: now,
    };

    this.state!.environmentModifications.push(mod);

    await this.saveState();

    return mod;
  }

  /**
   * Gets the current state
   */
  async getState(): Promise<NarrativeState> {
    if (!this.state) {
      await this.loadState();
    }

    return this.state!;
  }

  /**
   * Updates completion percentage based on content discovery
   */
  async updateCompletionPercentage(): Promise<number> {
    if (!this.state) {
      await this.loadState();
    }

    // This would be calculated based on multiple factors:
    // 1. Locations discovered / total locations
    // 2. Content discovered / total content
    // 3. Choices made / total possible choices
    // 4. Branch progress

    // Simplified version for now
    const totalLocations = 15; // Example total number of locations
    const locationProgress =
      this.state!.discoveredLocations.length / totalLocations;

    const totalContent = 30; // Example total pieces of content
    const contentProgress = this.state!.discoveredContent.length / totalContent;

    // Calculate weighted average
    const completionPercentage = Math.floor(
      (locationProgress * 0.4 + contentProgress * 0.6) * 100
    );

    this.state!.completionPercentage = completionPercentage;

    await this.saveState();

    return completionPercentage;
  }

  /**
   * Records the ending of a story
   */
  async recordEnding(endingType: string, endingSummary: string): Promise<void> {
    if (!this.state) {
      await this.loadState();
    }

    this.state!.endingType = endingType;
    this.state!.endingSummary = endingSummary;
    this.state!.completionPercentage = 100;

    await this.saveState(true); // Save immediately for ending
  }
}
```

### 1.3 DynamoDB Service Implementation

Let's implement the DynamoDB service that handles database operations:

```typescript
// src/services/DynamoDBService.ts

import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export class DynamoDBService {
  private client: DynamoDBClient;
  private tablePrefix: string;

  constructor() {
    this.client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    this.tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'DynamicNarrative_';
  }

  /**
   * Get the full table name with prefix
   */
  private getTableName(tableName: string): string {
    return `${this.tablePrefix}${tableName}`;
  }

  /**
   * Get an item from DynamoDB
   */
  async getItem(
    tableName: string,
    key: Record<string, any>
  ): Promise<Record<string, any> | null> {
    const params = {
      TableName: this.getTableName(tableName),
      Key: marshall(key),
    };

    try {
      const command = new GetItemCommand(params);
      const response = await this.client.send(command);

      if (!response.Item) {
        return null;
      }

      return unmarshall(response.Item);
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Put an item in DynamoDB
   */
  async putItem(tableName: string, item: Record<string, any>): Promise<void> {
    const params = {
      TableName: this.getTableName(tableName),
      Item: marshall(item),
    };

    try {
      const command = new PutItemCommand(params);
      await this.client.send(command);
    } catch (error) {
      console.error(`Error putting item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update an item in DynamoDB
   */
  async updateItem(
    tableName: string,
    key: Record<string, any>,
    updates: Record<string, any>
  ): Promise<void> {
    // Construct update expression and attribute values
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([field, value], index) => {
      const fieldName = `#field${index}`;
      const valueName = `:value${index}`;

      updateExpressions.push(`${fieldName} = ${valueName}`);
      expressionAttributeNames[fieldName] = field;
      expressionAttributeValues[valueName] = value;
    });

    const params = {
      TableName: this.getTableName(tableName),
      Key: marshall(key),
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
    };

    try {
      const command = new UpdateItemCommand(params);
      await this.client.send(command);
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Query items in DynamoDB
   */
  async queryItems(
    tableName: string,
    keyCondition: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
    indexName?: string
  ): Promise<Record<string, any>[]> {
    const params: any = {
      TableName: this.getTableName(tableName),
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
    };

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (indexName) {
      params.IndexName = indexName;
    }

    try {
      const command = new QueryCommand(params);
      const response = await this.client.send(command);

      if (!response.Items || response.Items.length === 0) {
        return [];
      }

      return response.Items.map((item) => unmarshall(item));
    } catch (error) {
      console.error(`Error querying items from ${tableName}:`, error);
      throw error;
    }
  }
}
```

## 2. Narrative Director Implementation

The Narrative Director is responsible for managing the flow of the story, determining which content to present next, and orchestrating the overall experience.

### 2.1 Story Director Class

```typescript
// src/services/StoryDirector.ts

import { StateManager } from './StateManager';
import { ContentGenerator } from './ContentGenerator';
import { BranchRegistry } from './BranchRegistry';
import { NarrativeSegment, BranchInfo, SceneData } from '../types/narrative';

export class StoryDirector {
  private stateManager: StateManager;
  private contentGenerator: ContentGenerator;
  private branchRegistry: BranchRegistry;

  constructor(storyId: string, userId: string) {
    this.stateManager = new StateManager(storyId, userId);
    this.contentGenerator = new ContentGenerator();
    this.branchRegistry = new BranchRegistry();
  }

  /**
   * Initialize a new story or load an existing one
   */
  async initialize(): Promise<SceneData> {
    const state = await this.stateManager.loadState();

    // If this is a new story (no choices made yet), generate initial content
    if (state.choices.length === 0) {
      return this.generateInitialStory();
    }

    // Existing story - load current segment
    return this.loadCurrentSegment();
  }

  /**
   * Generate the initial story setup
   */
  private async generateInitialStory(): Promise<SceneData> {
    // Get the initial story structure from LLM
    const initialStory = await this.contentGenerator.generateInitialStory();

    // Update state with generated title
    const state = await this.stateManager.getState();
    state.title = initialStory.title;
    await this.stateManager.saveState();

    // Register branches with the branch registry
    initialStory.branches.forEach((branch) => {
      this.branchRegistry.registerBranch(branch);
    });

    // Create and return initial scene
    const initialScene: SceneData = {
      location: state.currentLocation,
      narration: initialStory.opening_narration,
      narratorAttitude: state.narratorRelationship.attitude,
      availableInteractions: this.getAvailableInteractions(
        state.currentLocation
      ),
      environmentState: this.getInitialEnvironmentState(state.currentLocation),
      choices: initialStory.initial_choices || [],
    };

    return initialScene;
  }

  /**
   * Load the current narrative segment based on state
   */
  private async loadCurrentSegment(): Promise<SceneData> {
    const state = await this.stateManager.getState();

    // Get current branch information
    const currentBranch = this.branchRegistry.getBranch(state.currentBranch);

    // Get current segment from branch
    const currentSegment = this.findSegmentInBranch(
      currentBranch,
      state.currentSegment
    );

    // Create scene data from current state
    const sceneData: SceneData = {
      location: state.currentLocation,
      narration: currentSegment.narration,
      narratorAttitude: state.narratorRelationship.attitude,
      availableInteractions: this.getAvailableInteractions(
        state.currentLocation
      ),
      environmentState: this.getCurrentEnvironmentState(),
      choices: currentSegment.choices || [],
    };

    return sceneData;
  }

  /**
   * Find a specific segment within a branch
   */
  private findSegmentInBranch(
    branch: BranchInfo,
    segmentId: string
  ): NarrativeSegment {
    const segment = branch.segments.find((seg) => seg.id === segmentId);

    if (!segment) {
      throw new Error(`Segment ${segmentId} not found in branch ${branch.id}`);
    }

    return segment;
  }

  /**
   * Get available interactions for a location
   */
  private getAvailableInteractions(locationId: string): string[] {
    // This would come from a location registry in a full implementation
    // Simplified version for example purposes
    const locationInteractions: Record<string, string[]> = {
      office_starting_point: [
        'examine_desk',
        'look_out_window',
        'check_computer',
      ],
      office_hallway: ['try_doors', 'check_bulletin_board', 'look_at_photos'],
      meeting_room: [
        'examine_whiteboard',
        'check_presentation',
        'sit_at_table',
      ],
    };

    return locationInteractions[locationId] || [];
  }

  /**
   * Get initial environment state for a location
   */
  private getInitialEnvironmentState(locationId: string): Record<string, any> {
    // This would be loaded from a template in a full implementation
    // Simplified version for example purposes
    return {
      lighting: 'normal',
      doors: {
        hallway: 'unlocked',
        executive_office: 'locked',
      },
      objects: {
        desk: { state: 'normal', items: ['notepad', 'pen', 'photo_frame'] },
        computer: { state: 'on', screen: 'login' },
        window: { state: 'closed', view: 'city' },
      },
    };
  }

  /**
   * Get current environment state from state manager
   */
  private async getCurrentEnvironmentState(): Promise<Record<string, any>> {
    const state = await this.stateManager.getState();

    // Build environment state from base template and modifications
    const baseState = this.getInitialEnvironmentState(state.currentLocation);

    // Apply any active modifications
    state.environmentModifications
      .filter((mod) => mod.location === state.currentLocation && mod.triggered)
      .forEach((mod) => {
        // Apply modification based on type
        switch (mod.modificationType) {
          case 'appearance':
            // Update appearance of an object
            if (baseState.objects[mod.objectId]) {
              baseState.objects[mod.objectId].state = mod.modification;
            }
            break;
          case 'visibility':
            // Update visibility of an object
            if (baseState.objects[mod.objectId]) {
              baseState.objects[mod.objectId].visible = mod.modification;
            }
            break;
          case 'position':
            // Update position of an object
            if (baseState.objects[mod.objectId]) {
              baseState.objects[mod.objectId].position = mod.modification;
            }
            break;
          case 'state':
            // Update state of an environment feature
            baseState[mod.objectId] = mod.modification;
            break;
          case 'content':
            // Update content of an object (like screen text)
            if (baseState.objects[mod.objectId]) {
              baseState.objects[mod.objectId].content = mod.modification;
            }
            break;
        }
      });

    return baseState;
  }

  /**
   * Process a player choice
   */
  async processChoice(
    choiceId: string,
    selectedOption: string
  ): Promise<SceneData> {
    const state = await this.stateManager.getState();

    // Get current branch and segment
    const currentBranch = this.branchRegistry.getBranch(state.currentBranch);
    const currentSegment = this.findSegmentInBranch(
      currentBranch,
      state.currentSegment
    );

    // Find the chosen option
    const choice = currentSegment.choices?.find((c) => c.id === choiceId);

    if (!choice) {
      throw new Error(`Choice ${choiceId} not found in current segment`);
    }

    const option = choice.options.find((o) => o.id === selectedOption);

    if (!option) {
      throw new Error(
        `Option ${selectedOption} not found in choice ${choiceId}`
      );
    }

    // Record the choice
    await this.stateManager.recordChoice({
      location: state.currentLocation,
      optionSelected: selectedOption,
      narratorResponse: option.narratorResponse,
      branchImpact: {
        branch: option.branchImpact.branch,
        strengthOfImpact: option.branchImpact.strength,
      },
      relationshipImpact: {
        type: option.relationshipImpact.type,
        amount: option.relationshipImpact.amount,
      },
    });

    // Check if this choice causes a branch change
    if (option.branchImpact.strength >= 4) {
      // Major impact, switch branches
      await this.switchBranch(option.branchImpact.branch);
    } else {
      // Stay in same branch, but move to next segment
      await this.advanceToNextSegment(option.nextSegment);
    }

    // Generate the next scene
    return this.loadCurrentSegment();
  }

  /**
   * Handle a location change
   */
  async changeLocation(newLocationId: string): Promise<SceneData> {
    await this.stateManager.updateLocation(newLocationId);

    // Check if this location change triggers any narrative events
    const state = await this.stateManager.getState();
    const triggersEvent = this.checkLocationTriggers(newLocationId, state);

    if (triggersEvent) {
      // Process the triggered event
      await this.processLocationEvent(newLocationId);
    }

    // Load the scene for the new location
    return this.loadCurrentSegment();
  }

  /**
   * Check if entering a location triggers narrative events
   */
  private checkLocationTriggers(locationId: string, state: any): boolean {
    // Check branch definition for location triggers
    const currentBranch = this.branchRegistry.getBranch(state.currentBranch);

    // See if this location has a trigger defined
    const hasTrigger = currentBranch.locationTriggers?.some(
      (trigger) => trigger.locationId === locationId && !trigger.triggered
    );

    return !!hasTrigger;
  }

  /**
   * Process a location-triggered event
   */
  private async processLocationEvent(locationId: string): Promise<void> {
    const state = await this.stateManager.getState();
    const currentBranch = this.branchRegistry.getBranch(state.currentBranch);

    // Find the trigger for this location
    const trigger = currentBranch.locationTriggers?.find(
      (t) => t.locationId === locationId && !t.triggered
    );

    if (!trigger) return;

    // Mark trigger as activated
    trigger.triggered = true;

    // Apply any environment modifications
    if (trigger.environmentModifications) {
      for (const mod of trigger.environmentModifications) {
        await this.stateManager.applyEnvironmentModification({
          location: locationId,
          objectId: mod.objectId,
          modificationType: mod.type,
          modification: mod.value,
          trigger: `location_entry_${locationId}`,
        });
      }
    }

    // If this trigger changes the segment, update it
    if (trigger.nextSegment) {
      await this.advanceToNextSegment(trigger.nextSegment);
    }
  }

  /**
   * Switch to a different narrative branch
   */
  private async switchBranch(branchId: string): Promise<void> {
    const targetBranch = this.branchRegistry.getBranch(branchId);

    // Cannot switch to non-existent branch
    if (!targetBranch) {
      throw new Error(`Branch ${branchId} not found`);
    }

    // Update the current branch
    await this.stateManager.updateCurrentBranch(branchId);

    // Set the current segment to the branch's entry point
    const state = await this.stateManager.getState();
    state.currentSegment = targetBranch.entryPoint;
    await this.stateManager.saveState();
  }

  /**
   * Move to the next segment in the story
   */
  private async advanceToNextSegment(nextSegmentId: string): Promise<void> {
    const state = await this.stateManager.getState();

    // Update current segment
    state.currentSegment = nextSegmentId;

    // Add to discovered content if not already there
    if (!state.discoveredContent.includes(nextSegmentId)) {
      state.discoveredContent.push(nextSegmentId);
    }

    // Update completion percentage
    await this.stateManager.updateCompletionPercentage();

    await this.stateManager.saveState();
  }

  /**
   * Handle an object interaction
   */
  async handleInteraction(
    objectId: string,
    interactionType: string
  ): Promise<SceneData> {
    const state = await this.stateManager.getState();

    // Update object state
    await this.stateManager.updateObjectState(objectId, {
      currentState:
        interactionType === 'examine' ? 'examined' : interactionType,
    });

    // Generate narrator response to this interaction
    const narratorResponse =
      await this.contentGenerator.generateInteractionResponse(
        objectId,
        interactionType,
        state
      );

    // Check if interaction reveals personal content
    if (narratorResponse.personalReference) {
      await this.stateManager.recordPersonalReference({
        personalElementId: narratorResponse.personalReference.elementId,
        elementType: narratorResponse.personalReference.elementType,
        referenceContext: `object_interaction_${objectId}`,
        location: state.currentLocation,
        referenceType: narratorResponse.personalReference.referenceType,
        playerReaction: null,
      });
    }

    // Apply any environment modifications from the interaction
    if (narratorResponse.environmentModifications) {
      for (const mod of narratorResponse.environmentModifications) {
        await this.stateManager.applyEnvironmentModification({
          location: state.currentLocation,
          objectId: mod.objectId,
          modificationType: mod.type,
          modification: mod.value,
          trigger: `interaction_${objectId}_${interactionType}`,
        });
      }
    }

    // If interaction reveals a choice, present it
    let updatedScene = await this.loadCurrentSegment();

    if (narratorResponse.revealedChoice) {
      updatedScene.narration = narratorResponse.response;
      updatedScene.choices = [narratorResponse.revealedChoice];
    } else {
      // Otherwise just update narration with response
      updatedScene.narration = narratorResponse.response;
    }

    return updatedScene;
  }

  /**
   * Check if conditions are met for an ending
   */
  async checkForEnding(): Promise<boolean> {
    const state = await this.stateManager.getState();

    // Check completion percentage - some endings might be available at specific thresholds
    const completionPercentage = state.completionPercentage;

    // Check current branch - some branches lead to specific endings
    const currentBranch = state.currentBranch;

    // Check narrator relationship - can trigger specific endings
    const relationship = state.narratorRelationship;

    // Example ending checks
    if (
      currentBranch === 'rebellion_branch' &&
      relationship.attitude === 'antagonistic' &&
      completionPercentage > 80
    ) {
      await this.triggerEnding('rebellion_ending');
      return true;
    }

    if (
      currentBranch === 'compliance_branch' &&
      relationship.attitude === 'helpful' &&
      completionPercentage > 90
    ) {
      await this.triggerEnding('freedom_ending');
      return true;
    }

    if (
      currentBranch === 'truth_branch' &&
      state.discoveredContent.includes('hidden_evidence') &&
      completionPercentage > 75
    ) {
      await this.triggerEnding('truth_ending');
      return true;
    }

    return false;
  }

  /**
   * Trigger an ending sequence
   */
  private async triggerEnding(endingType: string): Promise<void> {
    // Generate ending content
    const endingContent = await this.contentGenerator.generateEnding(
      endingType
    );

    // Record the ending in state
    await this.stateManager.recordEnding(endingType, endingContent.summary);
  }
}
```

### 2.2 Branch Registry Implementation

The BranchRegistry stores and manages all narrative branches:

```typescript
// src/services/BranchRegistry.ts

import {
  BranchInfo,
  NarrativeSegment,
  LocationTrigger,
} from '../types/narrative';

export class BranchRegistry {
  private branches: Record<string, BranchInfo> = {};

  constructor() {
    // Initialize with some core branches
    this.initializeDefaultBranches();
  }

  /**
   * Set up default narrative branches
   */
  private initializeDefaultBranches(): void {
    // Define the introduction branch that all stories start with
    this.branches['introduction'] = {
      id: 'introduction',
      name: 'Introduction',
      description:
        'The beginning of the story where the player is introduced to the world',
      theme: 'discovery',
      entryPoint: 'introduction_segment_1',
      segments: [
        {
          id: 'introduction_segment_1',
          narration:
            'This is the beginning of your journey. You find yourself in an empty office, with no sign of your colleagues.',
          choices: [
            {
              id: 'intro_choice_1',
              text: 'What should you do first?',
              options: [
                {
                  id: 'examine_office',
                  text: 'Examine your office more carefully',
                  narratorResponse:
                    'A wise choice. Understanding your surroundings is always a good first step.',
                  branchImpact: {
                    branch: 'introduction',
                    strength: 1,
                  },
                  relationshipImpact: {
                    type: 'increase',
                    amount: 10,
                  },
                  nextSegment: 'introduction_segment_2',
                },
                {
                  id: 'leave_immediately',
                  text: 'Leave the office immediately',
                  narratorResponse:
                    'In a hurry, are we? There might be important clues in your office.',
                  branchImpact: {
                    branch: 'rebellion_branch',
                    strength: 2,
                  },
                  relationshipImpact: {
                    type: 'decrease',
                    amount: 15,
                  },
                  nextSegment: 'introduction_segment_3',
                },
              ],
            },
          ],
        },
        {
          id: 'introduction_segment_2',
          narration:
            "As you look around your office, you notice several strange details. Your calendar shows today's date, but the last entry is from weeks ago. Your computer is on, but locked.",
          choices: [
            {
              id: 'intro_choice_2',
              text: 'What do you want to investigate?',
              options: [
                {
                  id: 'check_calendar',
                  text: 'Examine the calendar more closely',
                  narratorResponse:
                    'You notice that several dates are marked with the same cryptic note: "M.C. Progress Review"',
                  branchImpact: {
                    branch: 'truth_branch',
                    strength: 3,
                  },
                  relationshipImpact: {
                    type: 'increase',
                    amount: 5,
                  },
                  nextSegment: 'truth_segment_1',
                },
                {
                  id: 'try_computer',
                  text: 'Try to unlock the computer',
                  narratorResponse:
                    'The password prompt stares back at you expectantly.',
                  branchImpact: {
                    branch: 'compliance_branch',
                    strength: 2,
                  },
                  relationshipImpact: {
                    type: 'increase',
                    amount: 5,
                  },
                  nextSegment: 'compliance_segment_1',
                },
              ],
            },
          ],
        },
        {
          id: 'introduction_segment_3',
          narration:
            "You step into the hallway. It's eerily quiet, with no sign of the usual Monday morning bustle. The doors to other offices are all closed.",
          choices: [
            {
              id: 'intro_choice_3',
              text: 'Where do you go?',
              options: [
                {
                  id: 'check_other_offices',
                  text: 'Check if other offices are occupied',
                  narratorResponse:
                    "Curious about your colleagues? I wouldn't bother if I were you.",
                  branchImpact: {
                    branch: 'rebellion_branch',
                    strength: 4,
                  },
                  relationshipImpact: {
                    type: 'decrease',
                    amount: 20,
                  },
                  nextSegment: 'rebellion_segment_1',
                },
                {
                  id: 'go_to_exit',
                  text: 'Head for the building exit',
                  narratorResponse: "Leaving so soon? But we've barely begun.",
                  branchImpact: {
                    branch: 'escape_branch',
                    strength: 5,
                  },
                  relationshipImpact: {
                    type: 'decrease',
                    amount: 30,
                  },
                  nextSegment: 'escape_segment_1',
                },
              ],
            },
          ],
        },
      ],
      locationTriggers: [
        {
          locationId: 'office_hallway',
          triggered: false,
          narratorComment:
            'The hallway stretches before you, silent and empty. Strange that nobody else seems to be here today.',
          environmentModifications: [
            {
              objectId: 'lights',
              type: 'state',
              value: 'flickering',
            },
          ],
          nextSegment: null,
        },
      ],
    };

    // Define major branches

    // Compliance branch - player follows narrator instructions
    this.branches['compliance_branch'] = {
      id: 'compliance_branch',
      name: 'The Path of Compliance',
      description: "The player generally follows the narrator's guidance",
      theme: 'order and purpose',
      entryPoint: 'compliance_segment_1',
      segments: [
        {
          id: 'compliance_segment_1',
          narration:
            "Good. Following instructions will make this experience much more pleasant for both of us. Now, let's see what your computer might reveal.",
          // Additional segments would be defined here
        },
      ],
    };

    // Rebellion branch - player defies narrator
    this.branches['rebellion_branch'] = {
      id: 'rebellion_branch',
      name: 'The Path of Defiance',
      description: 'The player consistently defies the narrator',
      theme: 'freedom and discovery',
      entryPoint: 'rebellion_segment_1',
      segments: [
        {
          id: 'rebellion_segment_1',
          narration:
            "I see we're determined to do this the difficult way. Very well. Let's see where your defiance leads you.",
          // Additional segments would be defined here
        },
      ],
    };

    // Truth branch - player seeks hidden information
    this.branches['truth_branch'] = {
      id: 'truth_branch',
      name: 'The Path of Truth',
      description:
        'The player focuses on uncovering the true nature of the situation',
      theme: 'reality and perception',
      entryPoint: 'truth_segment_1',
      segments: [
        {
          id: 'truth_segment_1',
          narration:
            "Your curiosity is... unexpected. Perhaps there's more to you than I initially thought.",
          // Additional segments would be defined here
        },
      ],
    };

    // Escape branch - player tries to leave
    this.branches['escape_branch'] = {
      id: 'escape_branch',
      name: 'The Path of Escape',
      description: 'The player attempts to escape the narrative',
      theme: 'boundaries and limitations',
      entryPoint: 'escape_segment_1',
      segments: [
        {
          id: 'escape_segment_1',
          narration:
            "You think it's that easy to leave? This story isn't finished yet. Not by a long shot.",
          // Additional segments would be defined here
        },
      ],
    };
  }

  /**
   * Register a new branch or update an existing one
   */
  registerBranch(branch: BranchInfo): void {
    this.branches[branch.id] = branch;
  }

  /**
   * Get a branch by ID
   */
  getBranch(branchId: string): BranchInfo {
    const branch = this.branches[branchId];

    if (!branch) {
      throw new Error(`Branch ${branchId} not found`);
    }

    return branch;
  }

  /**
   * Get all available branches
   */
  getAllBranches(): BranchInfo[] {
    return Object.values(this.branches);
  }

  /**
   * Get branches that can be accessed from the current branch
   */
  getAccessibleBranches(currentBranchId: string): string[] {
    const currentBranch = this.getBranch(currentBranchId);

    // If branch defines specific connections, use those
    if (currentBranch.connections) {
      return currentBranch.connections;
    }

    // Otherwise, return all branches except current
    return Object.keys(this.branches).filter((id) => id !== currentBranchId);
  }

  /**
   * Add a narrative segment to a branch
   */
  addSegmentToBranch(branchId: string, segment: NarrativeSegment): void {
    const branch = this.getBranch(branchId);

    // Check if segment already exists
    const existingIndex = branch.segments.findIndex((s) => s.id === segment.id);

    if (existingIndex >= 0) {
      // Update existing segment
      branch.segments[existingIndex] = segment;
    } else {
      // Add new segment
      branch.segments.push(segment);
    }
  }

  /**
   * Add a location trigger to a branch
   */
  addLocationTrigger(branchId: string, trigger: LocationTrigger): void {
    const branch = this.getBranch(branchId);

    if (!branch.locationTriggers) {
      branch.locationTriggers = [];
    }

    // Check if trigger already exists
    const existingIndex = branch.locationTriggers.findIndex(
      (t) => t.locationId === trigger.locationId
    );

    if (existingIndex >= 0) {
      // Update existing trigger
      branch.locationTriggers[existingIndex] = trigger;
    } else {
      // Add new trigger
      branch.locationTriggers.push(trigger);
    }
  }
}
```

## 3. LLM Integration with Content Generator

The ContentGenerator class manages interactions with the LLM API to generate dynamic narrative content:

````typescript
// src/services/ContentGenerator.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NarrativeState } from '../types/state';
import { UserProfile } from '../types/user';
import {
  InitialStoryResponse,
  InteractionResponse,
  EndingContent,
} from '../types/narrative';
import { PromptTemplates } from '../utils/promptTemplates';
import { LLMResponseCache } from '../utils/cacheUtils';

export class ContentGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private cache: LLMResponseCache;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.cache = new LLMResponseCache();
  }

  /**
   * Generate the initial story structure based on user profile
   */
  async generateInitialStory(
    userProfile?: UserProfile
  ): Promise<InitialStoryResponse> {
    // Try to get from cache first
    const cacheKey = userProfile
      ? `initial_story:${userProfile.userId}`
      : 'initial_story:default';
    const cachedResponse = await this.cache.get<InitialStoryResponse>(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // Prepare prompt based on user profile if available
      let prompt;

      if (userProfile) {
        prompt = PromptTemplates.initialStoryWithProfile(userProfile);
      } else {
        prompt = PromptTemplates.initialStoryDefault();
      }

      // Send request to LLM
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
        safetySettings: [
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
        ],
      });

      const responseText = result.response.text();

      // Parse JSON response
      let responseData: InitialStoryResponse;

      try {
        // Attempt to extract JSON if the response is wrapped in text
        const jsonMatch =
          responseText.match(/```json\n([\s\S]*?)\n```/) ||
          responseText.match(/{[\s\S]*}/);

        const jsonString = jsonMatch
          ? jsonMatch[1] || jsonMatch[0]
          : responseText;
        responseData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        // Fallback to default structure
        responseData = this.getDefaultInitialStory();
      }

      // Cache the response
      await this.cache.set(cacheKey, responseData, 86400); // Cache for 24 hours

      return responseData;
    } catch (error) {
      console.error('Error generating initial story:', error);
      // Return default structure in case of error
      return this.getDefaultInitialStory();
    }
  }

  /**
   * Default initial story in case of API failure
   */
  private getDefaultInitialStory(): InitialStoryResponse {
    return {
      title: 'The Empty Office',
      opening_narration:
        "This is the story of an office worker named Stanley. Stanley worked for a company in a big building where he was Employee #427. Employee #427's job was simple: he sat at his desk and pressed buttons on a keyboard...",
      branches: [
        {
          id: 'compliance_branch',
          name: 'The Path of Compliance',
          description: "Following the narrator's instructions",
          theme: 'order and authority',
          key_moments: [
            'Discovering the mind control facility',
            'Finding the truth about the company',
            'Making the final choice',
          ],
        },
        {
          id: 'rebellion_branch',
          name: 'The Path of Defiance',
          description: 'Consistently ignoring the narrator',
          theme: 'freedom and independence',
          key_moments: [
            'First act of defiance',
            'Breaking through to hidden areas',
            'Confrontation with the narrator',
          ],
        },
      ],
      initial_choices: [
        {
          id: 'first_choice',
          text: 'What will you do first?',
          options: [
            {
              id: 'follow_instructions',
              text: "Follow the narrator's guidance",
              narratorResponse:
                "Ah, I see you're the cooperative type. Excellent, this will make our journey much smoother.",
              branchImpact: {
                branch: 'compliance_branch',
                strength: 3,
              },
              relationshipImpact: {
                type: 'increase',
                amount: 20,
              },
              nextSegment: 'compliance_segment_1',
            },
            {
              id: 'ignore_instructions',
              text: 'Ignore the narrator and explore',
              narratorResponse:
                'I see. Already making your own choices. This might be more... interesting than I anticipated.',
              branchImpact: {
                branch: 'rebellion_branch',
                strength: 3,
              },
              relationshipImpact: {
                type: 'decrease',
                amount: 15,
              },
              nextSegment: 'rebellion_segment_1',
            },
          ],
        },
      ],
    };
  }

  /**
   * Generate response to player interacting with an object
   */
  async generateInteractionResponse(
    objectId: string,
    interactionType: string,
    state: NarrativeState
  ): Promise<InteractionResponse> {
    // Create cache key
    const cacheKey = `interaction:${state.storyId}:${objectId}:${interactionType}:${state.currentBranch}`;
    const cachedResponse = await this.cache.get<InteractionResponse>(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // Prepare context for LLM
      const narratorAttitude = state.narratorRelationship.attitude;
      const complianceLevel = state.narratorRelationship.complianceScore;
      const relevantChoices = state.choices.slice(-3); // Last 3 choices for context

      // Create prompt
      const prompt = PromptTemplates.objectInteraction(
        objectId,
        interactionType,
        narratorAttitude,
        complianceLevel,
        relevantChoices,
        state.currentBranch
      );

      // Send request to LLM
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const responseText = result.response.text();

      // Parse JSON response
      let responseData: InteractionResponse;

      try {
        // Attempt to extract JSON
        const jsonMatch =
          responseText.match(/```json\n([\s\S]*?)\n```/) ||
          responseText.match(/{[\s\S]*}/);

        const jsonString = jsonMatch
          ? jsonMatch[1] || jsonMatch[0]
          : responseText;
        responseData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing interaction response:', parseError);
        // Fallback to simple response
        responseData = {
          response: `You interact with the ${objectId}. Nothing unusual happens.`,
          environmentModifications: null,
          personalReference: null,
          revealedChoice: null,
        };
      }

      // Cache the response - shorter time since these are more contextual
      await this.cache.set(cacheKey, responseData, 3600); // Cache for 1 hour

      return responseData;
    } catch (error) {
      console.error('Error generating interaction response:', error);
      // Return simple fallback
      return {
        response: `You interact with the ${objectId}. Nothing unusual happens.`,
        environmentModifications: null,
        personalReference: null,
        revealedChoice: null,
      };
    }
  }

  /**
   * Generate narrator response to a player action
   */
  async generateNarratorResponse(
    action: string,
    state: NarrativeState
  ): Promise<string> {
    try {
      // Create prompt
      const prompt = PromptTemplates.narratorResponse(
        action,
        state.narratorRelationship,
        state.currentBranch,
        state.currentLocation,
        state.choices.slice(-3)
      );

      // Send request to LLM
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      });

      return result.response.text();
    } catch (error) {
      console.error('Error generating narrator response:', error);
      return 'I notice your action, but have nothing particular to say about it right now.';
    }
  }

  /**
   * Generate an ending sequence
   */
  async generateEnding(endingType: string): Promise<EndingContent> {
    try {
      // Create prompt
      const prompt = PromptTemplates.storyEnding(endingType);

      // Send request to LLM
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const responseText = result.response.text();

      // Parse JSON response
      let responseData: EndingContent;

      try {
        // Attempt to extract JSON
        const jsonMatch =
          responseText.match(/```json\n([\s\S]*?)\n```/) ||
          responseText.match(/{[\s\S]*}/);

        const jsonString = jsonMatch
          ? jsonMatch[1] || jsonMatch[0]
          : responseText;
        responseData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing ending response:', parseError);
        // Fallback to simple ending
        responseData = {
          title: 'The End',
          narration:
            "And so your story comes to a close. What you've learned and experienced along the way is yours to interpret.",
          summary: 'You reached the end of your journey.',
          thematicMessage: 'Sometimes the end is just another beginning.',
          revealedSecrets: [],
        };
      }

      return responseData;
    } catch (error) {
      console.error('Error generating ending:', error);
      // Return simple fallback
      return {
        title: 'The End',
        narration:
          "And so your story comes to a close. What you've learned and experienced along the way is yours to interpret.",
        summary: 'You reached the end of your journey.',
        thematicMessage: 'Sometimes the end is just another beginning.',
        revealedSecrets: [],
      };
    }
  }

  /**
   * Generate meta-commentary from the narrator
   */
  async generateMetaCommentary(
    trigger: string,
    state: NarrativeState
  ): Promise<string> {
    try {
      // Create prompt
      const prompt = PromptTemplates.metaCommentary(
        trigger,
        state.narratorRelationship,
        state.choices.slice(-5)
      );

      // Send request to LLM
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      });

      return result.response.text();
    } catch (error) {
      console.error('Error generating meta-commentary:', error);
      return "Did you ever stop to think about why you're making these choices? Just curious.";
    }
  }
}
````

## 4. API Routes Implementation

Now, let's implement the Next.js API routes that will expose our functionality to the frontend:

```typescript
// src/app/api/story/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { StateManager } from '@/services/StateManager';
import { ContentGenerator } from '@/services/ContentGenerator';
import { getUserFromClerk } from '@/utils/auth';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromClerk(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      characterDetails,
      lifeFacts,
      backstory,
      environment,
      narrativePreferences,
      images,
    } = body;

    // Validate required fields
    if (!characterDetails || !backstory || !environment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a new story ID
    const storyId = nanoid();

    // Initialize state manager with new story
    const stateManager = new StateManager(storyId, user.id);
    await stateManager.loadState();

    // Update state with user-provided information
    const state = await stateManager.getState();

    // Update character details
    state.characterDetails = characterDetails;

    // Store backstory and other details
    // Note: In a real implementation, we would store the actual content in S3
    // and just keep references here

    // Generate initial story content
    const contentGenerator = new ContentGenerator();
    const initialStory = await contentGenerator.generateInitialStory({
      userId: user.id,
      characterDetails,
      lifeFacts,
      backstory,
      environment,
      narrativePreferences,
    });

    // Update story title
    state.title = initialStory.title;

    // Save the updated state
    await stateManager.saveState(true);

    // Return the new story details
    return NextResponse.json({
      storyId,
      title: state.title,
      createdAt: state.createdAt,
      redirectUrl: `/experience/${storyId}`,
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/story/[storyId]/state/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { StateManager } from '@/services/StateManager';
import { getUserFromClerk } from '@/utils/auth';

interface RouteParams {
  params: {
    storyId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const user = await getUserFromClerk(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId } = params;

    // Initialize state manager
    const stateManager = new StateManager(storyId, user.id);

    // Get current state
    const state = await stateManager.getState();

    // Check if the story belongs to the user
    if (state.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error getting story state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/story/[storyId]/choice/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { StoryDirector } from '@/services/StoryDirector';
import { getUserFromClerk } from '@/utils/auth';

interface RouteParams {
  params: {
    storyId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const user = await getUserFromClerk(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId } = params;

    // Parse request body
    const body = await request.json();
    const { choiceId, selectedOption } = body;

    // Validate required fields
    if (!choiceId || !selectedOption) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize story director
    const storyDirector = new StoryDirector(storyId, user.id);
    await storyDirector.initialize();

    // Process the choice
    const nextScene = await storyDirector.processChoice(
      choiceId,
      selectedOption
    );

    // Check if the choice leads to an ending
    const isEnding = await storyDirector.checkForEnding();

    // Return the updated scene
    return NextResponse.json({
      scene: nextScene,
      isEnding,
    });
  } catch (error) {
    console.error('Error processing choice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/story/[storyId]/location/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { StoryDirector } from '@/services/StoryDirector';
import { getUserFromClerk } from '@/utils/auth';

interface RouteParams {
  params: {
    storyId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const user = await getUserFromClerk(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId } = params;

    // Parse request body
    const body = await request.json();
    const { locationId } = body;

    // Validate required fields
    if (!locationId) {
      return NextResponse.json(
        { error: 'Missing locationId' },
        { status: 400 }
      );
    }

    // Initialize story director
    const storyDirector = new StoryDirector(storyId, user.id);
    await storyDirector.initialize();

    // Process the location change
    const nextScene = await storyDirector.changeLocation(locationId);

    // Return the updated scene
    return NextResponse.json({
      scene: nextScene,
    });
  } catch (error) {
    console.error('Error changing location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/story/[storyId]/interaction/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { StoryDirector } from '@/services/StoryDirector';
import { getUserFromClerk } from '@/utils/auth';

interface RouteParams {
  params: {
    storyId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const user = await getUserFromClerk(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId } = params;

    // Parse request body
    const body = await request.json();
    const { objectId, interactionType } = body;

    // Validate required fields
    if (!objectId || !interactionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize story director
    const storyDirector = new StoryDirector(storyId, user.id);
    await storyDirector.initialize();

    // Process the interaction
    const updatedScene = await storyDirector.handleInteraction(
      objectId,
      interactionType
    );

    // Return the updated scene
    return NextResponse.json({
      scene: updatedScene,
    });
  } catch (error) {
    console.error('Error processing interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 5. Prompt Templates Utility

Let's implement the prompt templates used by our ContentGenerator:

```typescript
// src/utils/promptTemplates.ts

import { NarratorRelationship, Choice } from '../types/state';
import { UserProfile } from '../types/user';

export class PromptTemplates {
  /**
   * Generate initial story structure with user profile
   */
  static initialStoryWithProfile(userProfile: UserProfile): string {
    return `
You are generating a narrative experience inspired by "The Stanley Parable" for a web-based game.
Using the following user-provided information, create an initial story structure with multiple potential branches.

USER INFORMATION:
- Name: ${userProfile.characterDetails?.name || 'The Player'}
- Profession: ${userProfile.characterDetails?.profession || 'Office Worker'}
- Workplace: ${userProfile.characterDetails?.workplace || 'Generic Company'}
- Life Facts: ${
      userProfile.lifeFacts?.map((fact) => `• ${fact.content}`).join('\n') ||
      'No specific life facts provided'
    }
- Backstory: ${
      userProfile.backstory ||
      'Standard employee working in an office environment'
    }

ENVIRONMENT:
- Setting: ${userProfile.environment?.primarySetting || 'Office'}
- Mood: ${userProfile.environment?.mood || 'Mysterious'}
- Time Period: ${userProfile.environment?.timePeriod || 'Present Day'}

Create a JSON response with:
1. A title for this experience
2. An opening narration introducing the scenario
3. Initial branches based on different player choices
4. Initial choice options the player will encounter

RESPONSE FORMAT:
{
  "title": "Story title",
  "opening_narration": "Opening narration text that introduces the scenario",
  "branches": [
    {
      "id": "branch_identifier",
      "name": "Branch name",
      "description": "Brief description",
      "theme": "Central theme",
      "key_moments": ["list of 3-5 key narrative moments"]
    }
  ],
  "initial_choices": [
    {
      "id": "choice_id",
      "text": "Choice prompt text",
      "options": [
        {
          "id": "option_id",
          "text": "Option text shown to player",
          "narratorResponse": "Narrator's response if chosen",
          "branchImpact": {
            "branch": "affected_branch_id",
            "strength": 3 // 1-5 scale
          },
          "relationshipImpact": {
            "type": "increase", // or "decrease" or "none"
            "amount": 10 // 1-30 scale
          },
          "nextSegment": "segment_id_to_advance_to"
        }
      ]
    }
  ]
}
`;
  }

  /**
   * Generate initial story with default parameters
   */
  static initialStoryDefault(): string {
    return `
You are generating a narrative experience inspired by "The Stanley Parable" for a web-based game.
Create an initial story structure with multiple potential branches for a standard office worker scenario.

Create a JSON response with:
1. A title for this experience
2. An opening narration introducing the scenario
3. Initial branches based on different player choices
4. Initial choice options the player will encounter

RESPONSE FORMAT:
{
  "title": "Story title",
  "opening_narration": "Opening narration text that introduces the scenario",
  "branches": [
    {
      "id": "branch_identifier",
      "name": "Branch name",
      "description": "Brief description",
      "theme": "Central theme",
      "key_moments": ["list of 3-5 key narrative moments"]
    }
  ],
  "initial_choices": [
    {
      "id": "choice_id",
      "text": "Choice prompt text",
      "options": [
        {
          "id": "option_id",
          "text": "Option text shown to player",
          "narratorResponse": "Narrator's response if chosen",
          "branchImpact": {
            "branch": "affected_branch_id",
            "strength": 3 // 1-5 scale
          },
          "relationshipImpact": {
            "type": "increase", // or "decrease" or "none"
            "amount": 10 // 1-30 scale
          },
          "nextSegment": "segment_id_to_advance_to"
        }
      ]
    }
  ]
}
`;
  }

  /**
   * Generate a response to object interaction
   */
  static objectInteraction(
    objectId: string,
    interactionType: string,
    narratorAttitude: string,
    complianceLevel: number,
    recentChoices: Choice[],
    currentBranch: string
  ): string {
    return `
You are the narrator for a narrative experience inspired by "The Stanley Parable".
The narrator currently has the attitude: ${narratorAttitude}
The player's compliance level is: ${complianceLevel} (-100 to 100, negative means defiant)
The current narrative branch is: ${currentBranch}

RECENT PLAYER CHOICES:
${recentChoices
  .map(
    (choice) =>
      `- Selected "${choice.optionSelected}" at location "${choice.location}"`
  )
  .join('\n')}

CURRENT INTERACTION:
The player is attempting to ${interactionType} the object "${objectId}".

Generate the narrator's response to this interaction. Consider:
1. The narrator's current attitude toward the player
2. How this interaction fits with the current narrative branch
3. Whether this interaction deserves special attention or a casual comment
4. Any potential environmental changes that might result
5. Whether this could reveal a personal reference or a choice

RESPONSE FORMAT:
{
  "response": "The narrator's response text",
  "environmentModifications": [
    {
      "objectId": "id_of_object_to_modify",
      "type": "appearance", // or "position", "visibility", "state", "content"
      "value": "new_value_or_state"
    }
  ],
  "personalReference": {
    "elementId": "id_of_personal_element",
    "elementType": "name", // or "profession", "workplace", "lifeFact", "backstory", "image"
    "referenceType": "explicit" // or "implicit", "environmental"
  },
  "revealedChoice": {
    "id": "choice_id",
    "text": "Choice prompt text",
    "options": [
      {
        "id": "option_id",
        "text": "Option text shown to player",
        "narratorResponse": "Narrator's response if chosen",
        "branchImpact": {
          "branch": "affected_branch_id",
          "strength": 3
        },
        "relationshipImpact": {
          "type": "increase",
          "amount": 10
        },
        "nextSegment": "segment_id_to_advance_to"
      }
    ]
  }
}

Note: environmentModifications, personalReference, and revealedChoice can be null if not applicable.
`;
  }

  /**
   * Generate a narrator response to player action
   */
  static narratorResponse(
    action: string,
    relationship: NarratorRelationship,
    currentBranch: string,
    currentLocation: string,
    recentChoices: Choice[]
  ): string {
    return `
You are the narrator for a narrative experience inspired by "The Stanley Parable".
The narrator currently has the attitude: ${relationship.attitude}
The player's compliance level is: ${
      relationship.complianceScore
    } (-100 to 100, negative means defiant)
The narrator's knowledge of the player is: ${relationship.knowledgeOfPlayer}/100
The current narrative branch is: ${currentBranch}
The current location is: ${currentLocation}

RECENT PLAYER CHOICES:
${recentChoices
  .map(
    (choice) =>
      `- Selected "${choice.optionSelected}" at location "${choice.location}"`
  )
  .join('\n')}

CURRENT ACTION:
The player is attempting to: ${action}

Generate the narrator's response to this action. The response should be in the narrator's voice and reflect their current attitude toward the player. Keep it concise but impactful.
`;
  }

  /**
   * Generate a story ending
   */
  static storyEnding(endingType: string): string {
    return `
You are creating an ending sequence for a narrative experience inspired by "The Stanley Parable".
The player has reached the "${endingType}" ending.

Generate an impactful ending sequence that provides narrative closure while reflecting the themes of this particular ending type.

ENDING TYPES AND THEMES:
- freedom_ending: Freedom, escape from control, personal agency
- rebellion_ending: Defiance, consequences of rebellion, alternative paths
- truth_ending: Reality, meta-narrative, breaking the fourth wall
- compliance_ending: Order, purpose, the nature of following instructions
- escape_ending: Boundaries, limitations, the futility of escape attempts

RESPONSE FORMAT:
{
  "title": "Title of this ending",
  "narration": "The final narration text that plays during the ending sequence",
  "summary": "A brief summary of this ending for the player's records",
  "thematicMessage": "The philosophical or thematic message of this ending",
  "revealedSecrets": ["Any secrets or revelations this ending provides"]
}
`;
  }

  /**
   * Generate meta-commentary
   */
  static metaCommentary(
    trigger: string,
    relationship: NarratorRelationship,
    recentChoices: Choice[]
  ): string {
    return `
You are generating meta-commentary for a narrator in a game inspired by "The Stanley Parable."
The meta-commentary should break the fourth wall in a thoughtful, sometimes humorous way.

CONTEXT:
- Meta-commentary trigger: ${trigger}
- Narrator attitude: ${relationship.attitude}
- Player compliance level: ${
      relationship.complianceScore
    } (-100 to 100, negative means defiant)
- Narrator knowledge of player: ${relationship.knowledgeOfPlayer}/100

PLAYER CHOICE PATTERN:
${recentChoices
  .map(
    (choice) =>
      `- Selected "${choice.optionSelected}" at location "${choice.location}"`
  )
  .join('\n')}

Generate meta-commentary that:
1. Comments on the nature of choice in interactive narratives
2. Acknowledges the constructed nature of the experience
3. Reflects on the player's specific choice patterns
4. Raises philosophical questions about agency and determinism
5. Maintains a balance between humor and thoughtfulness

The commentary should be no more than 2-3 sentences and should be in the narrator's voice.
`;
  }
}
```

## 6. Utility Functions

Let's implement some essential utility functions:

```typescript
// src/utils/cacheUtils.ts

import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Generate a cache key with namespace
 */
export function getCacheKey(key: string): string {
  const prefix = process.env.CACHE_KEY_PREFIX || 'dynamic_narrative:';
  return `${prefix}${key}`;
}

/**
 * Get a value from cache
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return (value as T) || null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set a value in cache with expiration
 */
export async function setInCache(
  key: string,
  value: any,
  expirySeconds: number
): Promise<void> {
  try {
    await redis.set(key, value, { ex: expirySeconds });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * LLM response cache for managing content generation results
 */
export class LLMResponseCache {
  /**
   * Get a cached LLM response
   */
  async get<T>(key: string): Promise<T | null> {
    return getFromCache<T>(getCacheKey(`llm:${key}`));
  }

  /**
   * Cache an LLM response
   */
  async set<T>(key: string, value: T, expirySeconds: number): Promise<void> {
    return setInCache(getCacheKey(`llm:${key}`), value, expirySeconds);
  }

  /**
   * Invalidate a cached response
   */
  async invalidate(key: string): Promise<void> {
    try {
      await redis.del(getCacheKey(`llm:${key}`));
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}
```

```typescript
// src/utils/auth.ts

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Get the authenticated user from Clerk
 */
export async function getUserFromClerk(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return null;
    }

    // In a real implementation, you might want to fetch additional user info
    // from Clerk or your own database

    return {
      id: userId,
      // Add other user properties as needed
    };
  } catch (error) {
    console.error('Error getting user from Clerk:', error);
    return null;
  }
}
```

## 7. Narrative Type Definitions

Finally, let's define the remaining type definitions needed for our implementation:

```typescript
// src/types/narrative.ts

export interface InitialStoryResponse {
  title: string;
  opening_narration: string;
  branches: BranchInfo[];
  initial_choices?: Choice[];
}

export interface BranchInfo {
  id: string;
  name: string;
  description: string;
  theme: string;
  entryPoint: string;
  segments: NarrativeSegment[];
  locationTriggers?: LocationTrigger[];
  connections?: string[]; // IDs of branches this can connect to
}

export interface NarrativeSegment {
  id: string;
  narration: string;
  choices?: Choice[];
}

export interface Choice {
  id: string;
  text: string;
  options: ChoiceOption[];
}

export interface ChoiceOption {
  id: string;
  text: string;
  narratorResponse: string;
  branchImpact: {
    branch: string;
    strength: number; // 1-5 scale
  };
  relationshipImpact: {
    type: 'increase' | 'decrease' | 'none';
    amount: number;
  };
  nextSegment: string;
}

export interface LocationTrigger {
  locationId: string;
  triggered: boolean;
  narratorComment?: string;
  environmentModifications?: {
    objectId: string;
    type: 'appearance' | 'position' | 'visibility' | 'state' | 'content';
    value: any;
  }[];
  nextSegment: string | null;
}

export interface SceneData {
  location: string;
  narration: string;
  narratorAttitude: string;
  availableInteractions: string[];
  environmentState: Record<string, any>;
  choices: Choice[];
}

export interface InteractionResponse {
  response: string;
  environmentModifications:
    | {
        objectId: string;
        type: string;
        value: any;
      }[]
    | null;
  personalReference: {
    elementId: string;
    elementType: string;
    referenceType: string;
  } | null;
  revealedChoice: Choice | null;
}

export interface EndingContent {
  title: string;
  narration: string;
  summary: string;
  thematicMessage: string;
  revealedSecrets: string[];
}
```

```typescript
// src/types/user.ts

export interface UserProfile {
  userId: string;
  characterDetails?: {
    name?: string;
    profession?: string;
    workplace?: string;
    workplaceLogo?: string;
  };
  lifeFacts?: {
    factType: string;
    content: string;
  }[];
  backstory?: string;
  environment?: {
    primarySetting?: string;
    mood?: string;
    timePeriod?: string;
  };
  narrativePreferences?: {
    style?: string;
    themes?: string[];
    length?: string;
    metaLevel?: string;
  };
  images?: {
    imageId: string;
    type: string;
    description: string;
  }[];
}
```

This comprehensive implementation covers the core technical components of our dynamic narrative game, including:

1. State management for tracking player choices and narrative progression
2. Narrative branching and decision-making logic
3. LLM integration for dynamic content generation
4. API routes for frontend communication
5. Utilities for caching and authentication

With these components in place, you can build the frontend components using Next.js and Three.js to create the complete experience.
