# Dynamic Narrative Game - Technical Architecture Document

## 1. System Overview

### 1.1 Purpose

This document outlines the technical architecture for the dynamic narrative web game that creates personalized, AI-generated stories inspired by "The Stanley Parable." The system leverages Next.js 14, Three.js, and LLM integration to create unique narrative experiences based on user-provided information.

### 1.2 Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **3D Rendering**: Three.js
- **Authentication**: Clerk (social login via Google/Twitter/LinkedIn)
- **AI Integration**: gemini-1.5-flash LLM
- **Database**: Amazon DynamoDB
- **File Storage**: Amazon S3
- **Hosting**: Vercel
- **Analytics**: Posthog

### 1.3 High-Level Architecture

The system follows a modern cloud-native architecture with:

- Server-side rendering and client-side hydration via Next.js
- API-based communication between frontend and backend services
- Serverless functions for dynamic processing
- Event-driven architecture for narrative progression
- Content caching strategies for performance optimization
- Real-time state management for interactive experiences

## 2. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENT BROWSER                                │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            VERCEL HOSTING                                 │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                       NEXT.JS APPLICATION                           │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │  │
│  │  │   App Router    │  │   API Routes    │  │  Serverless Funcs   │ │  │
│  │  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘ │  │
│  │           │                    │                       │            │  │
│  │  ┌────────▼────────┐  ┌────────▼────────┐  ┌──────────▼──────────┐ │  │
│  │  │ React Components│  │  State Manager  │  │  Service Interfaces │ │  │
│  │  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘ │  │
│  │           │                    │                       │            │  │
│  │  ┌────────▼────────┐  ┌────────▼────────┐  ┌──────────▼──────────┐ │  │
│  │  │    Three.js     │  │ Narrative Engine│  │  Analytics Manager  │ │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES LAYER                           │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │     Clerk       │  │   Google LLM    │  │       AWS Services      │ │
│  │  Authentication │  │    gemini-1.5   │  │                         │ │
│  └────────┬────────┘  └────────┬────────┘  │  ┌─────────┐ ┌───────┐  │ │
│           │                    │            │  │DynamoDB │ │  S3   │  │ │
│           │                    │            │  └─────────┘ └───────┘  │ │
│           ▼                    ▼            └─────────────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │ JWT Auth Flow   │  │ Prompt Templates│  │    Analytics (Posthog)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. Component Details

### 3.1 Frontend Architecture

#### 3.1.1 Next.js App Structure

```
/src
  /app
    /(routes)      # App Router routes
      /page.tsx    # Homepage
      /layout.tsx  # Page layout
      /create      # Story creation flow
      /experience  # Story experience pages
      /profile     # User profile pages
    /api           # API routes
      /auth        # Authentication endpoints
      /story       # Story generation endpoints
      /user        # User data endpoints
      /images      # Image upload/retrieval endpoints
  /components    # Reusable React components
    /ui          # Basic UI components
    /three       # Three.js components
    /narrative   # Narrative-specific components
    /forms       # Form components
  /lib           # Utility functions and hooks
  /styles        # Global styles
  /hooks         # Custom React hooks
  /contexts      # React contexts
/public        # Static assets



```

#### 3.1.2 Key Frontend Components

**Story Creation Flow**

- `StoryCreationForm`: Multi-step form collecting user information
- `CharacterDetailsForm`: Fields for name, profession, workplace
- `LifeFactsManager`: Dynamic management of life fact entries
- `BackstoryEditor`: Rich text editor for backstory input
- `ImageUploader`: S3 presigned URL-based upload component
- `EnvironmentSelector`: Visual selection of environment templates

**Three.js Environment**

- `ThreeJSEnvironment`: Core 3D rendering component
- `FirstPersonControls`: Camera and movement control system
- `SceneManager`: Dynamic environment loading and management
- `InteractiveObjects`: System for handling interactive elements
- `NarratorSystem`: Audio and text display for narrator voice
- `ChoiceInterface`: Visual display of player choices

**Narrative Interface**

- `StoryStateManager`: Tracks narrative progression and choices
- `NarratorDisplay`: Shows narrator text with typing animation
- `ChoicePresenter`: Displays and handles choice selections
- `InteractionPrompt`: Indicates interactive objects
- `InventorySystem`: Tracks discovered items (if applicable)
- `EndingSequence`: Handles story conclusion and summary

### 3.2 Backend Architecture

#### 3.2.1 API Endpoints

**Authentication Endpoints**

- `POST /api/auth/login`: Handles Clerk authentication
- `GET /api/auth/session`: Returns current session information
- `POST /api/auth/logout`: Ends user session

**User Data Endpoints**

- `GET /api/user/profile`: Retrieves user profile information
- `POST /api/user/profile`: Updates user profile
- `GET /api/user/stories`: Lists all user's created stories
- `DELETE /api/user/stories/:id`: Deletes a story

**Story Endpoints**

- `POST /api/story/create`: Initiates story creation with user input
- `GET /api/story/:id`: Retrieves story data and state
- `POST /api/story/:id/progress`: Updates story progress
- `POST /api/story/:id/choice`: Records player choice
- `GET /api/story/:id/state`: Gets current narrative state

**Image Endpoints**

- `POST /api/images/upload`: Generates S3 presigned URL for upload
- `GET /api/images/list`: Lists user's uploaded images
- `DELETE /api/images/:id`: Removes image from storage

**Narrative Endpoints**

- `POST /api/narrative/generate`: Generates narrative content via LLM
- `POST /api/narrative/narrator`: Generates narrator response to action
- `POST /api/narrative/environment`: Gets environment modifications based on state

#### 3.2.2 Serverless Functions

- `storyInitializer`: Processes user inputs and generates initial story structure
- `narrativeGenerator`: Calls LLM API to generate narrative content
- `choiceProcessor`: Evaluates player choices and updates story state
- `environmentGenerator`: Creates Three.js environment based on story parameters
- `imageProcessor`: Optimizes and validates uploaded images
- `narratorVoiceGenerator`: Manages narrator voice generation and delivery
- `endingGenerator`: Creates personalized story ending and summary

### 3.3 Data Flow Architecture

#### 3.3.1 Story Creation Flow

1. User logs in via Clerk authentication
2. User fills out story creation form
3. Client validates input data
4. Images uploaded to S3 via presigned URLs
5. Form data and image references sent to `/api/story/create`
6. `storyInitializer` function processes inputs and creates narrative structure
7. Initial LLM call generates story foundation
8. DynamoDB stores story structure, state, and references
9. User redirected to experience page with unique story ID

#### 3.3.2 Gameplay Flow

1. User accesses experience page with story ID
2. App loads story state from DynamoDB
3. Three.js environment initialized based on story parameters
4. Initial narrative content loaded from state
5. As player navigates and makes choices:
   - Interactions sent to `/api/story/:id/progress`
   - Choices sent to `/api/story/:id/choice`
   - `choiceProcessor` updates story state
   - `narrativeGenerator` creates new content based on choices
   - Updated state saved to DynamoDB
   - New content streamed to client
6. When ending conditions met, ending sequence triggered

## 4. Data Models

### 4.1 User Model

```json
{
  "userId": "string", // Primary key (from Clerk)
  "email": "string", // User email
  "createdAt": "timestamp", // Account creation time
  "lastLogin": "timestamp", // Last login time
  "preferences": {
    // User preferences
    "theme": "string", // UI theme preference
    "narratorVoice": "string", // Preferred narrator voice
    "contentFilters": "object" // Content filtering settings
  }
}
```

### 4.2 Story Model

```json
{
  "storyId": "string", // Primary key (UUID)
  "userId": "string", // Foreign key to User
  "title": "string", // Generated story title
  "createdAt": "timestamp", // Creation timestamp
  "lastPlayed": "timestamp", // Last accessed timestamp
  "completed": "boolean", // Whether story has been completed
  "characterDetails": {
    // User-provided character info
    "name": "string",
    "profession": "string",
    "workplace": "string",
    "workplaceLogo": "string" // S3 URL
  },
  "lifeFacts": [
    // Array of life facts
    {
      "factId": "string",
      "factType": "string", // Achievement, Event, Relationship
      "content": "string" // The fact content
    }
  ],
  "backstory": "string", // User-provided backstory
  "environment": {
    // Environment settings
    "primarySetting": "string",
    "mood": "string",
    "timePeriod": "string"
  },
  "narrativePreferences": {
    // Storytelling preferences
    "style": "string",
    "themes": ["string"],
    "length": "string",
    "metaLevel": "string"
  },
  "images": [
    // User-uploaded images
    {
      "imageId": "string",
      "s3Key": "string",
      "type": "string", // Portrait, Location, Object, etc.
      "description": "string"
    }
  ]
}
```

### 4.3 StoryState Model

```json
{
  "storyId": "string", // Primary key (matches Story)
  "currentBranch": "string", // Current narrative branch
  "currentLocation": "string", // Current environment location
  "narratorRelationship": "string", // Current narrator attitude
  "choicesLog": [
    // Array of all choices made
    {
      "choiceId": "string",
      "timestamp": "number",
      "optionSelected": "string",
      "consequence": "string"
    }
  ],
  "discoveredLocations": ["string"], // Areas player has visited
  "discoveredItems": ["string"], // Items player has found
  "narrativeVariables": {
    // Dynamic story variables
    // Custom key-value pairs tracking story state
  },
  "endingType": "string", // If completed, which ending reached
  "completionPercentage": "number" // % of content discovered
}
```

### 4.4 NarrativeContent Model

```json
{
  "storyId": "string", // Primary key (matches Story)
  "narrativeSegments": [
    // All generated narrative content
    {
      "segmentId": "string", // Unique segment identifier
      "type": "string", // Exposition, Choice, Reaction, etc.
      "content": "string", // Narrator text
      "location": "string", // Associated environment
      "triggers": {
        // Conditions that trigger this segment
        "location": "string",
        "interaction": "string",
        "choiceOutcome": "string"
      },
      "choices": [
        // If a choice point
        {
          "choiceId": "string",
          "text": "string", // Choice display text
          "consequence": "string", // Where this leads
          "narratorResponse": "string" // Narrator reaction
        }
      ]
    }
  ],
  "environmentModifications": [
    // Environment state changes
    {
      "modificationId": "string",
      "location": "string", // Affected location
      "objectId": "string", // Affected object
      "modificationType": "string", // Appearance, Position, etc.
      "modification": "object", // Specific changes
      "trigger": "string" // What causes this change
    }
  ]
}
```

## 5. Data Flow Diagrams

### 5.1 Authentication Flow

```
┌──────────┐     1. Initiate Login     ┌──────────┐
│  Client  │─────────────────────────▶│   Clerk  │
│          │                          │          │
│          │     2. OAuth Redirect    │          │
│          │◀─────────────────────────│          │
└────┬─────┘                          └────┬─────┘
     │                                     │
     │  3. Auth Code                       │
     ▼                                     ▼
┌──────────┐     4. Verify Token     ┌──────────┐
│ Next.js  │─────────────────────────▶│  Clerk   │
│   API    │                          │  API     │
│          │     5. User Data         │          │
│          │◀─────────────────────────│          │
└────┬─────┘                          └──────────┘
     │
     │  6. Create Session
     ▼
┌──────────┐
│ DynamoDB │
│  User    │
│  Table   │
└──────────┘
```

### 5.2 Story Creation Flow

```
┌──────────┐     1. Form Data         ┌──────────┐
│  Client  │─────────────────────────▶│ Next.js  │
│          │                          │   API    │
└──────────┘                          └────┬─────┘
                                           │
                                           │  2. Initialize Story
                                           ▼
┌──────────┐     3. Store Images      ┌──────────┐
│  AWS S3  │◀────────────────────────┐│Serverless│
│          │                          │Functions │
└──────────┘                          └────┬─────┘
                                           │
                                           │  4. Generate Structure
                                           ▼
┌──────────┐     5. Create Story      ┌──────────┐
│ DynamoDB │◀────────────────────────┐│ LLM API  │
│          │                          │ gemini   │
└──────────┘                          └──────────┘
```

### 5.3 Gameplay Interaction Flow

```
┌──────────┐     1. User Action       ┌──────────┐
│  Client  │─────────────────────────▶│ Next.js  │
│ Three.js │                          │   API    │
│          │                          │          │
│          │     6. New Content       │          │
│          │◀─────────────────────────│          │
└──────────┘                          └────┬─────┘
                                           │
                                           │  2. Process Action
                                           ▼
┌──────────┐     3. Retrieve State    ┌──────────┐
│ DynamoDB │◀───────────────────────▶│Serverless│
│          │                          │Functions │
└──────────┘                          └────┬─────┘
                                           │
                                           │  4. Generate Response
                                           ▼
                                      ┌──────────┐
                                      │ LLM API  │
                                      │ gemini   │
                                      │          │
                                      │          │
                                      └──────────┘
```

## 6. API Specifications

### 6.1 Story Creation API

**Endpoint:** `POST /api/story/create`

**Request:**

```json
{
  "characterDetails": {
    "name": "string",
    "profession": "string",
    "workplace": "string"
  },
  "lifeFacts": [
    {
      "factType": "string",
      "content": "string"
    }
  ],
  "backstory": "string",
  "environment": {
    "primarySetting": "string",
    "mood": "string",
    "timePeriod": "string"
  },
  "narrativePreferences": {
    "style": "string",
    "themes": ["string"],
    "length": "string",
    "metaLevel": "string"
  },
  "images": [
    {
      "imageId": "string",
      "type": "string",
      "description": "string"
    }
  ]
}
```

**Response:**

```json
{
  "storyId": "string",
  "title": "string",
  "initialNarration": "string",
  "redirectUrl": "string"
}
```

### 6.2 Story Progress API

**Endpoint:** `POST /api/story/:id/progress`

**Request:**

```json
{
  "action": "string", // move, interact, observe
  "location": "string", // Current location
  "interactionTarget": "string", // Object being interacted with
  "duration": "number" // Time spent in location
}
```

**Response:**

```json
{
  "narration": "string", // New narrator content
  "environmentChanges": [
    // Updates to environment
    {
      "objectId": "string",
      "changes": "object"
    }
  ],
  "newChoices": [
    // If a choice point is triggered
    {
      "choiceId": "string",
      "text": "string"
    }
  ]
}
```

### 6.3 Story Choice API

**Endpoint:** `POST /api/story/:id/choice`

**Request:**

```json
{
  "choiceId": "string",
  "selectedOption": "string",
  "timeToDecide": "number" // How long player took to choose
}
```

**Response:**

```json
{
  "narration": "string", // Narrator response
  "outcome": "string", // Consequence description
  "branchChange": "boolean", // If major branch change occurred
  "narratorRelationship": "string" // Updated relationship
}
```

## 7. LLM Integration

### 7.1 gemini-1.5-flash Implementation

The system leverages Google's gemini-1.5-flash LLM for dynamic narrative generation:

- **Context Window**: 5,000+ tokens to maintain story coherence
- **Temperature**: Variability in response creativity (0.7-0.9 range)
- **Top-k**: 50 for diverse but controlled responses
- **Top-p**: 0.95 for natural language generation
- **Response Format**: Structured JSON for consistent parsing
- **Streaming**: Enabled for real-time narrative delivery

### 7.2 Prompt Templates

The system uses several prompt templates:

**1. Story Initialization**

```
You are generating a narrative experience inspired by "The Stanley Parable" for a web-based game.
Using the following user-provided information, create an initial story structure with multiple potential branches.

USER INFORMATION:
- Name: {{characterDetails.name}}
- Profession: {{characterDetails.profession}}
- Workplace: {{characterDetails.workplace}}
- Life Facts: {{lifeFacts}}
- Backstory: {{backstory}}

ENVIRONMENT:
- Setting: {{environment.primarySetting}}
- Mood: {{environment.mood}}
- Time Period: {{environment.timePeriod}}

Create a JSON response with:
1. A title for this experience
2. An opening narration introducing the scenario
3. Initial location description
4. 3-5 potential narrative branches based on initial choices
5. Narrator personality profile
6. Integration points for the provided life facts
7. Key themes to explore based on backstory

RESPONSE FORMAT:
{...JSON structure...}
```

**2. Narrator Response**

```
You are the narrator for a dynamic narrative experience inspired by "The Stanley Parable".
The narrator has the following personality traits: {{narratorTraits}}
The narrator's current relationship with the player is: {{narratorRelationship}}

STORY CONTEXT:
- Current branch: {{currentBranch}}
- Current location: {{currentLocation}}
- Recent choices: {{recentChoices}}

PLAYER ACTION:
The player has {{action}} at location {{location}}.

Generate the narrator's response to this action, considering:
1. The narrator's current relationship with player
2. The narrative implications of this action
3. Potential fourth-wall breaking if appropriate ({{metaLevel}})
4. References to player's backstory where natural
5. Advancement of the current narrative thread

RESPONSE FORMAT:
{
  "narration": "Narrator's text response",
  "tone": "emotional tone",
  "significanceLevel": 1-5,
  "integrationPoints": ["life fact references"],
  "suggestedFollowup": "potential next story beat"
}
```

### 7.3 State Tracking for LLM Context

To maintain narrative coherence across LLM calls:

- Story state is preserved in DynamoDB
- Each LLM call includes relevant previous context
- Key decision points and narrative beats are tracked
- Narrator relationship evolution is maintained
- User-provided details accessible throughout generation
- Content safety boundaries enforced consistently

### 7.4 Fallback Mechanisms

To handle LLM failures or limitations:

- Cached responses for common interactions
- Templated fallbacks for API outages
- Error recovery through state restoration
- Graceful degradation to simpler narrative paths
- Built-in retries with backoff for transient issues
- Manual review triggers for edge cases

## 8. Three.js Implementation

### 8.1 Environment Architecture

The 3D environment is structured as:

- **BaseEnvironment**: Core rendering and physics system
- **EnvironmentTemplates**: Setting-specific base environments (office, home, etc.)
- **DynamicObjects**: Programmatically placed interactive elements
- **PersonalizedElements**: User image and detail integration points
- **EffectsSystem**: Visual effects for narrative emphasis
- **AudioManager**: Spatial audio and narrator voice

### 8.2 Object Interaction System

Objects in the environment support:

- **Highlighting**: Visual indication of interactivity
- **Interaction Types**: Examine, Use, Take, Combine
- **State Changes**: Visual changes reflecting narrative progression
- **Trigger Zones**: Areas activating narrative events
- **Container Objects**: Items that can hold other items
- **Personal Object Integration**: User images as in-world elements

### 8.3 Performance Optimization

For smooth performance across devices:

- **Level of Detail (LOD)**: Multiple asset fidelity levels
- **Occlusion Culling**: Only rendering visible objects
- **Asset Streaming**: Dynamic loading of environment sections
- **Texture Compression**: Optimized for web delivery
- **Shader Optimization**: Efficient rendering pipelines
- **Memory Management**: Asset cleanup and garbage collection

## 9. Authentication and Security

### 9.1 Clerk Integration

The authentication flow using Clerk:

1. User initiates login with social provider
2. Clerk manages OAuth flow and token exchange
3. Upon successful authentication, Clerk returns JWT
4. Next.js API verifies JWT for all authenticated requests
5. User session tracked with HTTP-only cookies
6. Sensitive operations require re-authentication

### 9.2 Data Security

- **User Data**: Encrypted at rest in DynamoDB
- **Images**: Access-controlled via S3 policies
- **API Endpoints**: Rate limiting and CSRF protection
- **Environment Variables**: Secrets management via Vercel
- **LLM API Keys**: Server-side only, never exposed to client
- **Personal Information**: Minimization principles applied

### 9.3 Content Safety

- **User Input Validation**: Filtering of inappropriate content
- **Image Screening**: Automated and manual review process
- **LLM Safety Guardrails**: Content filtering parameters
- **Narrative Boundaries**: Restricted story topics and themes
- **User Reporting**: Mechanism for flagging problematic content
- **Audit Logging**: Tracking of content generation process

## 10. Scalability and Performance

### 10.1 Scaling Strategy

- **Vertical Scaling**: Optimized code for single-instance performance
- **Horizontal Scaling**: Stateless API design for multi-instance deployment
- **Serverless Architecture**: Auto-scaling based on demand
- **Database Scaling**: DynamoDB on-demand capacity
- **Content Caching**: CDN for static assets and common responses
- **LLM Request Management**: Queueing and prioritization

### 10.2 Performance Targets

- **Initial Page Load**: < 2 seconds
- **Three.js Environment Load**: < 5 seconds
- **Interaction Response Time**: < 200ms
- **LLM Response Time**: < 3 seconds for narrative generation
- **Image Upload Time**: < 5 seconds for processing
- **60 FPS**: Target framerate for Three.js environment

### 10.3 Monitoring and Optimization

- **Real-time Metrics**: Performance tracking via Posthog
- **Error Tracking**: Comprehensive logging and alerting
- **User Experience Metrics**: Time to first interaction, engagement duration
- **Resource Utilization**: CPU, memory, and API call optimization
- **Cost Monitoring**: Usage patterns and optimization opportunities
- **A/B Testing**: Performance impact of implementation variations

## 11. Implementation Dependencies

### 11.1 Frontend Dependencies

- next: ^14.0.0
- react: ^18.2.0
- react-dom: ^18.2.0
- three: ^0.160.0
- @types/three: ^0.160.0
- @clerk/nextjs: ^4.24.0
- @react-three/fiber: ^8.15.11
- @react-three/drei: ^9.88.16
- posthog-js: ^1.96.1
- tailwindcss: ^3.3.5
- zustand: ^4.4.6
- react-hook-form: ^7.48.2
- zod: ^3.22.4

### 11.2 Backend Dependencies

- @clerk/backend: ^0.30.0
- aws-sdk: ^2.1499.0
- dynamodb-toolbox: ^0.8.5
- @google/generative-ai: ^0.1.1
- sharp: ^0.32.6
- nanoid: ^5.0.3
- jose: ^5.1.1

### 11.3 Development Tools

- typescript: ^5.2.2
- eslint: ^8.53.0
- prettier: ^3.1.0
- jest: ^29.7.0
- cypress: ^13.5.1
- husky: ^8.0.3
- lint-staged: ^15.1.0

## 12. Deployment Architecture

### 12.1 Vercel Deployment

The application is deployed on Vercel with:

- Production, staging, and development environments
- Automated deployments from GitHub
- Environment-specific configuration
- Edge network distribution for global performance
- Serverless functions for API endpoints
- Incremental Static Regeneration where applicable

### 12.2 AWS Resources

AWS services utilized:

- **DynamoDB**: NoSQL database for user and story data
- **S3**: Image storage and static asset hosting
- **CloudFront**: CDN for asset distribution
- **IAM**: Granular permission management
- **Lambda**: Supplementary serverless functions
- **CloudWatch**: Monitoring and alerting

### 12.3 CI/CD Pipeline

Continuous integration and deployment workflow:

1. Code pushed to feature branch
2. Automated tests run (unit, integration)
3. Preview deployment created
4. Manual QA review
5. PR merged to main branch
6. Staging deployment updated
7. Acceptance testing
8. Production deployment

## 13. Analytics Implementation

### 13.1 Posthog Integration

User behavior tracking via Posthog:

- Page views and navigation patterns
- Feature usage and interaction metrics
- Story completion and branch selection
- Performance and error metrics
- A/B test participation
- User engagement duration

### 13.2 Custom Event Tracking

Key events tracked include:

- `story_created`: New story initialization
- `narrative_choice`: Player decision points
- `environment_explored`: Areas visited
- `object_interaction`: Environmental engagement
- `narrator_relationship`: Changes in narrator attitude
- `story_completed`: Ending reached
- `replay_initiated`: Starting a new playthrough

### 13.3 Analytics Dashboard

Key metrics displayed:

- Story completion rate
- Average session duration
- Most common narrative branches
- Popular choice patterns
- Performance metrics by device/browser
- User retention and repeat plays
- Content discovery percentage

## 14. Extensibility and Future Enhancements

### 14.1 Modular Design for Extensions

The architecture supports future enhancements:

- **New Environment Templates**: Additional setting types
- **Narrator Voice Expansion**: Alternative narrator personalities
- **Multiplayer Elements**: Shared narrative experiences
- **Mobile Adaptation**: Responsive design for smaller screens
- **VR Compatibility**: WebXR integration possibility
- **External API**: Public API for third-party integration

### 14.2 Planned Enhancements

Future development roadmap includes:

- **Collaborative Stories**: Multiple user contributions
- **Advanced Image Processing**: Deeper integration of user images
- **Voice Input**: Speech recognition for player choices
- **Adaptive Difficulty**: Personalized narrative complexity
- **Extended Endings**: More elaborate conclusion sequences
- **Story Templates**: Genre-specific narrative frameworks

## Appendices

### A. Environment Variable Specification

```
# Authentication
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# AWS Services
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
DYNAMODB_TABLE_PREFIX=

# LLM Integration
GEMINI_API_KEY=
LLM_SAFETY_THRESHOLD=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
POSTHOG_API_SECRET=
POSTHOG_PROJECT_ID=

# Deployment
VERCEL_PROJECT_ID=
VERCEL_ORG_ID=
```

### B. API Error Codes

| Code | Description             | Resolution                   |
| ---- | ----------------------- | ---------------------------- |
| 401  | Unauthorized            | Reauthenticate user          |
| 403  | Forbidden               | Check permissions            |
| 404  | Resource not found      | Verify IDs and paths         |
| 409  | Conflict                | Resolve data collision       |
| 422  | Validation error        | Check input format           |
| A001 | LLM generation failed   | Retry with fallback prompts  |
| A002 | Image processing error  | Check file format and size   |
| A003 | Story state corruption  | Restore from backup state    |
| A004 | Resource limit exceeded | Implement throttling/caching |

### C. Database Access Patterns

| Access Pattern             | Index Type  | Query Example           |
| -------------------------- | ----------- | ----------------------- |
| Get user by ID             | Primary key | userId = "user_123"     |
| Get user stories           | GSI         | userId = "user_123"     |
| Get story by ID            | Primary key | storyId = "story_456"   |
| Get story state            | Primary key | storyId = "story_456"   |
| List recent stories        | GSI         | createdAt > [timestamp] |
| Get narrative content      | Primary key | storyId = "story_456"   |
| Find stories by completion | GSI         | completed = true        |

### D. Three.js Component Hierarchy

```
ThreeJSEnvironment
├── SceneManager
│   ├── EnvironmentTemplate
│   ├── LightingSystem
│   └── WeatherEffects
├── PlayerController
│   ├── FirstPersonCamera
│   ├── MovementSystem
│   └── CollisionDetection
├── InteractionSystem
│   ├── RaycastManager
│   ├── HighlightController
│   └── InteractiveObjectManager
├── NarrativeIntegration
│   ├── TriggerZones
│   ├── StateReactiveObjects
│   └── EnvironmentModifier
└── PerformanceOptimizer
    ├── LODManager
    ├── OcclusionController
    └── AssetStreamingSystem
```
