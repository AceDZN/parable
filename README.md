# Parable - Dynamic Narrative Web Game

A web-based narrative exploration game inspired by "The Stanley Parable" that leverages LLMs to generate unique, personalized stories for each player. The game dynamically creates narrative content, choices, and environments based on user-provided character details and backstory, ensuring every playthrough is unique.

## Features

- Fully personalized narrative based on player-provided information
- AI-generated content ensures unlimited replayability
- Deep integration of player's actual life elements creates emotional resonance
- Modern web technologies provide accessible, cross-platform experience
- Meta-commentary on player choice similar to "The Stanley Parable"
- User-uploaded images integrated into the game environment

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **3D Rendering**: Three.js for immersive environment
- **Authentication**: Clerk with social login (Google/Twitter/LinkedIn)
- **AI Integration**: gemini-1.5-flash LLM for dynamic content generation
- **Database**: DynamoDB - Managed NoSQL Database
- **Image Storage**: AWS S3
- **Hosting**: Vercel
- **Analytics**: Posthog

## Getting Started

### Prerequisites

- Node.js 18.x or later
- AWS account (for DynamoDB and S3)
- Google API key for gemini-1.5-flash

### Installation

1. Clone the repository

```bash
git clone https://github.com/acedzn/parable.git
cd parable
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```
# Create a .env.local file with the following variables
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
DYNAMODB_TABLE_PREFIX=

GEMINI_API_KEY=
LLM_SAFETY_THRESHOLD=

NEXT_PUBLIC_POSTHOG_KEY=
POSTHOG_API_SECRET=
POSTHOG_PROJECT_ID=
```

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

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

## Features

### Story Creation

- Multi-step form for character creation
- Dynamic life facts management
- Rich text editor for backstory
- Image upload for personal content
- Environment and theme selection

### Gameplay

- First-person 3D environment navigation
- Branching narrative based on choices
- AI narrator that responds to player actions
- Personal content integration into the game world
- Multiple endings based on player decisions

## Documentation

For more detailed information, see the following documents:

- [Product Requirements Document](./documentation/PRD.md)
- [Technical Architecture Document](./documentation/technical-architecture.md)

## Contributing

We welcome contributions to Parable! Please see our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by "The Stanley Parable" by Davey Wreden and William Pugh
- Built with Next.js by Vercel
