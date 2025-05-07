# LLM Prompt Engineering Documentation

## 1. Introduction

This document outlines the strategies and techniques for implementing effective LLM-driven narrative generation in our dynamic narrative game. We'll be using Google's gemini-1.5-flash model to create personalized storytelling experiences based on user-provided details.

### 1.1 Purpose and Scope

- Define prompt engineering strategies for narrative generation
- Establish contextual management techniques
- Document prompt templates for key game functions
- Outline parameter optimization approaches
- Specify content safety implementation

### 1.2 LLM Integration Goals

- **Personalized Narratives**: Generate stories incorporating user details
- **Dynamic Narrator**: Create a responsive narrator with consistent personality
- **Meaningful Choices**: Develop coherent branching narratives based on decisions
- **Environmental Integration**: Connect narrative elements to 3D environment
- **Meta-Commentary**: Enable fourth-wall breaking similar to "The Stanley Parable"

## 2. LLM Architecture Overview

### 2.1 System Components

```
LLM Integration Pipeline
├── Prompt Template System        // Manages and populates prompt templates
├── Context Manager               // Maintains coherent story context across calls
├── Parameter Optimizer           // Adjusts LLM parameters based on content type
├── Response Parser               // Processes and validates LLM outputs
├── Content Safety Filter         // Ensures appropriate content generation
├── Fallback System               // Handles API failures or inappropriate responses
└── Memory Manager                // Tracks narrative history and user choices
```

### 2.2 Integration Points

The LLM system interfaces with other components through:

1. **Narrative Engine**: Receives state updates and choice information
2. **User Data Store**: Accesses character details and preferences
3. **Environment System**: Provides location context and receives environment modifications
4. **Interface Layer**: Delivers narrator text and choice options to player
5. **Analytics System**: Records LLM performance and response quality

## 3. Prompt Engineering Fundamentals

### 3.1 Prompt Structure Principles

All prompts should follow this general structure:

1. **Context Definition**: Sets the narrative framework
2. **Role Assignment**: Defines the LLM's role (usually narrator)
3. **Task Description**: Specific generation task
4. **Input Data**: User-provided information and game state
5. **Output Format**: Expected response structure
6. **Constraints**: Limitations and requirements
7. **Examples**: When needed for complex formats

### 3.2 Context Management Strategy

Managing context across multiple LLM calls:

1. **Token Budgeting**:

   - Reserve 15-20% of context window for system instructions
   - Allocate 30-40% for user data and narrative history
   - Save 40-50% for immediate context and response generation

2. **Context Compression**:

   - Summarize past interactions rather than including verbatim
   - Store key decision points rather than full interaction history
   - Use semantic indexing to retrieve relevant past content
   - Implement importance weighting for narrative events

3. **Context Refreshing**:
   - Periodically reestablish full context to prevent drift
   - Refresh character details at branch points
   - Include complete prompt structure during significant transitions
   - Implement explicit consistency checks at key story points

### 3.3 Output Formatting

Standardize LLM outputs through:

1. **JSON Structure**:

   - All responses in parseable JSON format
   - Consistent key naming conventions
   - Required and optional fields clearly defined
   - Error handling for malformed responses

2. **Content Typing**:

   - Explicitly typed content sections (narration, choices, metadata)
   - Content length controls for each section
   - Tone indicators for voice processing
   - Special instruction markers for UI rendering

3. **Template Examples**:

```
{
  "narration": "Narrator's text content",
  "tone": "curious|serious|amused|concerned|neutral",
  "choices": [
    {
      "id": "choice_1",
      "text": "Option text for player",
      "consequence": "Brief description of outcome",
      "narratorResponse": "Narrator's reaction if selected"
    }
  ],
  "environment": {
    "modifications": [
      {
        "type": "visual|audio|interactive",
        "target": "object_id or area",
        "change": "Description of change"
      }
    ]
  },
  "metadata": {
    "branchShift": true|false,
    "relationshipChange": "direction and magnitude",
    "personalReferences": ["fact_id_1", "fact_id_2"]
  }
}
```

## 4. Core Prompt Templates

### 4.1 Story Initialization Prompt

This prompt creates the initial narrative structure based on user input:

```
You are generating a personalized narrative experience inspired by "The Stanley Parable" for a web-based 3D exploration game.

ROLE: You are a creative narrative designer creating the foundation for an interactive story.

TASK: Using the provided user information, create a complete narrative structure with multiple potential branches.

USER INFORMATION:
Character Name: {{characterDetails.name}}
Profession: {{characterDetails.profession}}
Workplace: {{characterDetails.workplace}}
Life Facts:
{{#each lifeFacts}}
- {{this.content}} ({{this.factType}})
{{/each}}
Backstory:
{{backstory}}

ENVIRONMENT PREFERENCES:
Primary Setting: {{environment.primarySetting}}
Mood/Tone: {{environment.mood}}
Time Period: {{environment.timePeriod}}

NARRATIVE PREFERENCES:
Style: {{narrativePreferences.style}}
Themes: {{narrativePreferences.themes}}
Length: {{narrativePreferences.length}}
Meta-Commentary Level: {{narrativePreferences.metaLevel}}

UPLOADED IMAGES:
{{#each images}}
- {{this.type}}: {{this.description}}
{{/each}}

OUTPUT REQUIREMENTS:
1. Create a JSON response with the following structure
2. Include a compelling title for this experience
3. Provide an opening narration (200-300 words) that introduces the scenario
4. Define the initial environment state and key locations
5. Create 3-5 potential narrative branches based on likely player choices
6. Develop a consistent narrator personality profile matching the requested mood
7. Identify integration points for the provided life facts
8. Establish key themes based on the backstory and preferences

The story should begin with the character in their workplace environment, discovering something unusual that sets the narrative in motion. The narrator should address the character directly and establish a relationship that can evolve based on player choices.

IMPORTANT CONSTRAINTS:
- The narrative must allow for meaningful choices with consequences
- The story should include meta-commentary on choice and narrative similar to "The Stanley Parable"
- Personal details should be integrated naturally, not forced
- The narrator personality should be distinct and consistent
- The story should support approximately 30-45 minutes of exploration
- Multiple endings (at least 5) should be possible

OUTPUT FORMAT:
{
  "title": "Experience Title",
  "openingNarration": "Initial narrator text...",
  "environment": {
    "initialLocation": "Starting area description",
    "keyLocations": [
      {
        "name": "Location name",
        "description": "Location description",
        "significance": "Narrative purpose",
        "personalConnectionPoint": "Connection to user details"
      }
    ]
  },
  "narrativeBranches": [
    {
      "branchId": "unique_identifier",
      "branchName": "Descriptive name",
      "triggerType": "choice|exploration|defiance",
      "branchTheme": "Core theme explored",
      "keyNarrativeBeats": [
        "Description of significant moment",
        "Another key event"
      ],
      "potentialEndings": [
        {
          "endingId": "ending_identifier",
          "endingName": "Descriptive name",
          "endingDescription": "What happens",
          "personalRelevance": "Connection to character"
        }
      ]
    }
  ],
  "narratorProfile": {
    "voice": "Description of narrative voice",
    "initialAttitude": "Starting relationship with player",
    "quirks": ["Distinctive characteristics"],
    "evolutionFactors": ["How narrator might change"]
  },
  "personalDetailIntegration": [
    {
      "factId": "id_from_input",
      "integrationPoint": "Where/how this appears",
      "narrativeSignificance": "Why it matters to story"
    }
  ],
  "thematicElements": [
    {
      "theme": "Core theme",
      "exploration": "How it's explored",
      "symbolism": "Visual or narrative symbols"
    }
  ]
}
```

### 4.2 Narrator Response Prompt

This prompt generates narrator responses to player actions:

```
You are the narrator in a dynamic narrative experience inspired by "The Stanley Parable".

ROLE: You are the voice guiding, responding to, and sometimes challenging the player throughout their journey.

CURRENT NARRATOR PROFILE:
Voice: {{narratorProfile.voice}}
Current Relationship: {{narratorProfile.currentAttitude}}
Key Characteristics: {{narratorProfile.quirks}}

PLAYER CONTEXT:
Character Name: {{characterDetails.name}}
Profession: {{characterDetails.profession}}
Current Location: {{currentLocation.name}}
Recent Actions: {{recentActions}}
Choice Pattern: {{playerChoicePattern}} (following/defying/mixed)

STORY STATE:
Current Branch: {{currentBranch.name}}
Narrative Progress: {{narrativeProgress}}%
Recent Discoveries: {{recentDiscoveries}}
Unresolved Elements: {{unresolvedElements}}

CURRENT ACTION:
Action Type: {{action.type}} (move|interact|observe|choose)
Specific Action: {{action.description}}
Target Object/Area: {{action.target}}
Action Context: {{action.context}}

TASK: Generate the narrator's response to this specific player action. Your response should:
1. Reflect the narrator's established personality
2. Respond appropriately to the specific action
3. Advance the narrative based on current branch
4. Incorporate meta-commentary at appropriate level ({{metaLevel}})
5. Reference personal details when natural
6. Suggest environmental changes if appropriate

CONSTRAINTS:
- Maintain consistent narrative voice
- Responses should be 2-5 sentences for normal actions
- Important moments can have longer responses (up to 200 words)
- Include only ONE personal reference per response unless central to moment
- Meta-commentary should match user's selected level
- Humor and philosophy should align with established tone

OUTPUT FORMAT:
{
  "narration": "The narrator's response text",
  "tone": "emotional tone of delivery",
  "significance": 1-5 (narrative importance),
  "personalReferences": ["factId_1", "factId_2"],
  "suggestedEnvironmentChanges": [
    {
      "type": "change type",
      "target": "affected object/area",
      "description": "change details"
    }
  ],
  "followupPossibilities": [
    "potential player action",
    "another potential action"
  ],
  "internalNotes": "guidance for next prompt"
}
```

### 4.3 Choice Generation Prompt

This prompt creates meaningful choices at decision points:

```
You are generating choice options for a narrative experience inspired by "The Stanley Parable".

ROLE: You are designing decision points that will meaningfully impact the story progression.

CURRENT NARRATIVE CONTEXT:
Location: {{currentLocation.name}}
Situation: {{currentSituation}}
Player History: {{relevantPlayerHistory}}
Narrator Relationship: {{narratorRelationship}}
Available Branches: {{availableBranches}}

TASK: Create a set of 2-4 meaningful choices for the player at this decision point. These choices should:
1. Represent meaningfully different directions for the narrative
2. Reflect the established themes and tone
3. Include options for both following and defying narrator expectations
4. Connect to player's personal details where appropriate
5. Vary in their degree of risk or certainty

CHOICE DESIGN PRINCIPLES:
- Avoid obvious good/bad binary framing
- Create interesting consequences for all options
- Balance pragmatic and emotional considerations
- Use character-appropriate language and concerns
- Include subtle fourth-wall awareness when appropriate

OUTPUT FORMAT:
{
  "situationDescription": "Brief context for choices",
  "choices": [
    {
      "id": "choice_identifier",
      "text": "What player sees as option",
      "narratorExpectation": true|false,
      "leadsToBranch": "branch_id",
      "narratorResponse": "How narrator reacts",
      "immediateConsequence": "What happens right after",
      "longTermImplication": "Later impact"
    }
  ],
  "presentationNotes": {
    "urgency": 1-5,
    "environmentalEmphasis": "any special effects",
    "narratorDelivery": "how narrator presents choices"
  }
}
```

### 4.4 Environment Modification Prompt

This prompt generates environment changes based on narrative progression:

```
You are generating environment modifications for a narrative experience in a 3D world.

ROLE: You are translating narrative developments into visual, audio, and interactive changes in the game environment.

CURRENT ENVIRONMENT:
Location: {{currentLocation.name}}
Description: {{currentLocation.description}}
Current State: {{currentLocation.state}}
Notable Objects: {{currentLocation.objects}}
Atmosphere: {{currentLocation.atmosphere}}

NARRATIVE CONTEXT:
Recent Events: {{recentNarrativeEvents}}
Player Choices: {{relevantPlayerChoices}}
Current Branch: {{currentBranch.name}}
Narrative Progress: {{narrativeProgress}}%
Thematic Elements: {{activeThemes}}

TASK: Based on the narrative progression, generate modifications to the current environment that:
1. Visually represent story developments
2. Create appropriate mood and atmosphere
3. Emphasize thematic elements
4. Incorporate personal details when appropriate
5. Support upcoming narrative beats

MODIFICATION TYPES:
- Visual changes (lighting, color, object appearance)
- State changes (doors opening/closing, machines activating)
- Object additions/removals
- Atmospheric effects (particles, post-processing)
- Audio environment adjustments
- Interactive opportunity changes

OUTPUT FORMAT:
{
  "environmentModifications": [
    {
      "type": "modification type",
      "target": "affected object/area",
      "description": "detailed change description",
      "purpose": "narrative reasoning",
      "intensity": 1-5,
      "duration": "temporary|permanent|conditional",
      "trigger": "what causes this change"
    }
  ],
  "atmosphereShift": {
    "lighting": "lighting changes",
    "color": "color palette adjustment",
    "sound": "audio environment changes",
    "particles": "atmospheric particle effects"
  },
  "newInteractionOpportunities": [
    {
      "objectId": "target object",
      "interactionType": "how player can interact",
      "narrativeConnection": "how it connects to story"
    }
  ]
}
```

### 4.5 Ending Generation Prompt

This prompt creates personalized story endings:

```
You are generating a personalized ending for a narrative experience inspired by "The Stanley Parable".

ROLE: You are crafting the conclusion to the player's unique journey, reflecting their choices and character.

PLAYER JOURNEY:
Character: {{characterDetails.name}}, {{characterDetails.profession}}
Key Choices: {{significantPlayerChoices}}
Narrator Relationship: {{finalNarratorRelationship}}
Branch Path: {{completedBranch.name}}
Discovered Content: {{discoveryPercentage}}%
Personal Elements Used: {{incorporatedPersonalDetails}}

TASK: Create a meaningful and satisfying ending that:
1. Resolves the narrative branch appropriately
2. Reflects the player's choice pattern and relationship with narrator
3. Incorporates personal details in a meaningful way
4. Provides philosophical or meta-narrative commentary
5. Encourages reflection on the experience
6. Hints at other possible endings

ENDING STRUCTURE:
- Final Narration (200-300 words)
- Environmental Visualization
- Character Fate/Resolution
- Meta-Commentary Element
- Epilogue/Reflection
- Subtle Replay Encouragement

OUTPUT FORMAT:
{
  "endingId": "unique_identifier",
  "endingTitle": "Descriptive name",
  "finalNarration": "Complete narrator text for ending",
  "environmentalState": {
    "visualDescription": "How environment appears",
    "atmosphericElements": "Special effects, lighting, etc.",
    "finalImagery": "Symbolic or meaningful visuals"
  },
  "characterResolution": {
    "fate": "What happens to character",
    "personalConnection": "Tie to player-provided details",
    "emotionalNote": "Feeling this ending evokes"
  },
  "metaNarrative": {
    "commentary": "Fourth-wall or philosophical elements",
    "gameReflection": "Commentary on game/story experience"
  },
  "epilogue": "Brief text suggesting aftermath or meaning",
  "replayHint": "Subtle indication of other possibilities"
}
```

## 5. Parameter Optimization

### 5.1 Model Parameters

Optimize gemini-1.5-flash parameters for different narrative functions:

| Narrative Function         | Temperature | Top-P | Top-K | Max Tokens | Notes                                       |
| -------------------------- | ----------- | ----- | ----- | ---------- | ------------------------------------------- |
| Story Initialization       | 0.7         | 0.95  | 50    | 4000       | Balanced creativity and coherence           |
| Narrator Responses         | 0.6-0.8     | 0.92  | 40    | 1000       | Varies by narrator relationship             |
| Environmental Descriptions | 0.5         | 0.9   | 30    | 1500       | More consistent, less variation             |
| Choice Generation          | 0.75        | 0.94  | 45    | 1200       | Creative but logical options                |
| Critical Plot Points       | 0.4         | 0.85  | 20    | 2000       | More deterministic for consistency          |
| Meta-Commentary            | 0.85        | 0.97  | 60    | 1000       | Higher creativity for philosophical content |
| Endings                    | 0.65        | 0.93  | 40    | 3000       | Balanced for resolution satisfaction        |

### 5.2 Dynamic Parameter Adjustment

Implement logic to adjust parameters based on:

1. **Narrator Relationship**:

   - Higher temperature when narrator is defiant/antagonistic
   - Lower temperature when narrator is guiding/helpful
   - Adjusted top-p based on narrative certainty

2. **Story Phase**:

   - Introduction: Moderate temperature for consistent setup
   - Middle: Higher variation for branching possibilities
   - Climax: More controlled for coherent resolution
   - Ending: Balanced for satisfaction and closure

3. **User Preferences**:

   - Adjust based on narrative style preference
   - Modify for meta-commentary level
   - Fine-tune for thematic emphasis

4. **Content Type**:
   - Descriptive: Lower temperature for clarity
   - Philosophical: Higher temperature for insight
   - Emotional: Tuned for appropriate intensity
   - Humorous: Adjusted for wit without randomness

### 5.3 Prompt Weighting Techniques

Implement emphasis techniques for prompt elements:

1. **Importance Markers**:

   - [CRITICAL] for must-include elements
   - [PREFERRED] for desired but optional elements
   - [CONTEXT] for background information

2. **Recency Weighting**:

   - Most recent actions at end of context
   - Explicit timestamps for temporal clarity
   - Decay function for older information

3. **Repetition Strategy**:
   - Repeat critical character details in different sections
   - Redundant constraint mentions for important boundaries
   - Consistent formatting for key information

## 6. Context Window Management

### 6.1 Token Budgeting Strategy

With a context window of 5,000+ tokens, allocate:

1. **Fixed Allocations**:

   - System Instructions: 800-1000 tokens (15-20%)
   - User Character Profile: 500-700 tokens (10-15%)
   - Current State Description: 300-500 tokens (5-10%)
   - Response Format: 200-300 tokens (4-6%)

2. **Variable Allocations**:

   - Interaction History: 1000-2000 tokens (20-40%)
   - Current Context: 500-1000 tokens (10-20%)
   - Branch-Specific Information: 300-700 tokens (5-15%)
   - Reserved for Response: 1000-1500 tokens (20-30%)

3. **Prioritization During Constraints**:
   - Sacrifice older history first
   - Maintain full character profile
   - Keep complete current context
   - Preserve format instructions

### 6.2 Context Compression Techniques

To maximize effective context window use:

1. **Summarization Methods**:

   - Abstract past interactions to key points
   - Use semantic compression of repeated concepts
   - Create running summaries of narrative branches
   - Implement decision-tree tracking instead of full history

2. **Structured References**:

   - Use identifiers to reference known elements
   - Create shorthand for common concepts
   - Implement hierarchical information structure
   - Use JSON format for dense information packing

3. **Information Pruning**:
   - Remove redundant descriptions
   - Eliminate inconsequential interactions
   - Expire time-limited context
   - Filter out unused character details

### 6.3 Context Refreshing Strategy

To prevent context drift over multiple interactions:

1. **Periodic Reanchoring**:

   - Full context refresh every 10-15 interactions
   - Complete character detail restatement at branch points
   - Narrator personality reinforcement during tone shifts
   - Theme and goal reminder at key decision points

2. **Triggered Refreshes**:

   - After significant player choice
   - When entering new environment
   - If inconsistency detected
   - Upon narrative branch transition

3. **Hierarchical Refreshing**:
   - Primary elements (character, location) refreshed most often
   - Secondary elements (relationships, objects) refreshed periodically
   - Tertiary elements (background details) refreshed rarely
   - Critical constraints refreshed every interaction

## 7. Response Handling

### 7.1 Output Validation

Implement validation checks for LLM responses:

1. **Structural Validation**:

   - JSON format compliance
   - Required fields presence
   - Data type correctness
   - Length constraints adherence

2. **Content Validation**:

   - Narrative consistency checks
   - Tone/voice alignment
   - Character detail accuracy
   - Thematic appropriateness

3. **Technical Validation**:
   - Environment compatibility
   - Action possibility verification
   - State transition validity
   - Resource requirement check

### 7.2 Error Recovery

When validation fails:

1. **Retry Strategies**:

   - Immediate retry with same prompt (transient errors)
   - Modified prompt with explicit correction
   - Simplified request scope
   - Alternative prompt formulation

2. **Fallback Responses**:

   - Pre-authored generic responses by category
   - Templated responses with variable filling
   - Graceful error acknowledgment when appropriate
   - Narrator "confusion" as in-universe explanation

3. **Human Intervention Triggers**:
   - Repeated validation failures
   - Critical path blockers
   - Content safety flags
   - Logical impossibilities

### 7.3 Response Processing

Post-validation processing pipeline:

1. **Content Extraction**:

   - Parse structured JSON
   - Extract narrative text
   - Identify environment changes
   - Capture metadata for tracking

2. **Enhancement Processing**:

   - Tone markers for voice modulation
   - Emphasis tags for UI rendering
   - Timing information for delivery
   - Animation triggers for environment

3. **Delivery Preparation**:
   - Text segmentation for typing effect
   - Audio cue assignment
   - Synchronization points for environment changes
   - Choice presentation formatting

## 8. Content Safety

### 8.1 Proactive Safety Measures

1. **Prompt Construction**:

   - Explicit content boundaries in system instructions
   - Topic avoidance directives
   - Tone guidance for sensitive subjects
   - Clear purpose statement for context

2. **Parameter Settings**:

   - Lower temperature for sensitive topics
   - Reduced maximum generation length where appropriate
   - Strict top-p filtering for greater predictability
   - Safety-first sampling methods

3. **Input Filtering**:
   - User input screening for problematic content
   - Personal detail appropriateness verification
   - Image description review
   - Sensitive topic detection

### 8.2 Reactive Safety Measures

1. **Content Filtering**:

   - Output scanning for inappropriate content
   - Toxicity detection on generated text
   - Personal information leakage prevention
   - Sensitive topic boundary enforcement

2. **Response Modification**:

   - Content replacement for borderline material
   - Tone adjustment for potentially problematic areas
   - Redirecting from sensitive topics
   - Generic fallbacks for rejected content

3. **User Communication**:
   - Clear explanation of content boundaries
   - Alternative suggestion provision
   - Educational framing where appropriate
   - Transparency about modifications when suitable

### 8.3 Human-in-the-Loop Safety

1. **Review Triggers**:

   - Specific topic/keyword flagging
   - Uncertainty classification by model
   - User report handling
   - Pattern detection for boundary testing

2. **Review Process**:

   - Internal task creation for review
   - Content quarantine during review
   - Temporary safe substitution
   - Resolution tracking and implementation

3. **Feedback Integration**:
   - Prompt refinement based on issues
   - Boundary clarification in instructions
   - Edge case documentation
   - LLM fine-tuning consideration

## 9. Personalization Techniques

### 9.1 Character Detail Integration

Strategies for incorporating user-provided information:

1. **Direct References**:

   - Using character name in narrator address
   - Mentioning workplace in environmental context
   - Referencing profession in challenges or solutions
   - Incorporating life facts in narrative reveals

2. **Indirect Integration**:

   - Thematic alignment with personal history
   - Environmental elements reflecting interests
   - Challenge design matching skill background
   - Symbolic representation of life events

3. **Contextual Adaptation**:
   - Professional terminology matching background
   - Problem-solving approaches aligned with expertise
   - Value conflicts reflecting personal history
   - Relationship dynamics mirroring provided facts

### 9.2 Narrative Personalization

Adapting story structure to user details:

1. **Motivation Alignment**:

   - Character goals reflecting provided aspirations
   - Conflicts resonating with past challenges
   - Narrative questions addressing personal themes
   - Resolution options matching value system

2. **Environment Customization**:

   - Workplace details matching provided information
   - Personal items referring to life facts
   - Location elements drawing from backstory
   - Discovery rewards connected to interests

3. **Relationship Dynamics**:
   - Narrator tone adapted to personality implications
   - NPC-like elements referencing mentioned relationships
   - Authority structures reflecting workplace hierarchy
   - Interaction styles matching implied preferences

### 9.3 Meta-Narrative Personalization

Fourth-wall elements customized to user:

1. **Self-Awareness Calibration**:

   - Meta-commentary frequency based on preference
   - Philosophical depth matching implied sophistication
   - Humor style aligned with detectable preferences
   - Existential questions relevant to personal history

2. **Personal Insight Integration**:

   - Commentary on choice patterns connected to life facts
   - Philosophical questions related to character background
   - Alternative life path speculation using personal details
   - Reality/fiction boundary exploration using provided context

3. **User Relationship Building**:
   - Progressive narrator familiarity with preferences
   - Callback references to previous choices
   - Recognition of exploration patterns
   - Acknowledgment of approach to narrative/gameplay

## 10. Testing and Evaluation

### 10.1 Prompt Evaluation Framework

Assess prompt effectiveness through:

1. **Objective Metrics**:

   - Response consistency score
   - Format compliance percentage
   - Context retention measurement
   - Generation time performance
   - Token usage efficiency

2. **Subjective Evaluation**:

   - Narrative coherence rating
   - Personalization effectiveness score
   - Voice consistency assessment
   - Creativity and surprise rating
   - Emotional impact evaluation

3. **Comparative Testing**:
   - A/B testing of prompt variations
   - Baseline comparison with templates
   - Cross-parameter performance
   - Version improvement tracking

### 10.2 Edge Case Testing

Systematically test challenging scenarios:

1. **Unusual User Inputs**:

   - Minimalist character details
   - Excessive information provision
   - Boundary-testing content
   - Contradictory personal information

2. **Interaction Patterns**:

   - Extreme consistency (always following/defying)
   - Erratic choice patterns
   - Rapid interaction sequences
   - Extended exploration without progression

3. **Technical Challenges**:
   - Connection interruptions
   - Delayed responses
   - Context window saturation
   - Concurrent requests

### 10.3 Iteration Methodology

Process for prompt refinement:

1. **Data Collection**:

   - Response log analysis
   - Error pattern identification
   - User satisfaction metrics
   - Performance bottlenecks

2. **Prompt Refinement**:

   - Targeted constraint adjustment
   - Example refinement or addition
   - Structure optimization
   - Weighting recalibration

3. **Validation Cycle**:
   - Regression testing on previous issues
   - Comparative performance evaluation
   - Edge case verification
   - Production simulation testing

## 11. Implementation Checklist

### 11.1 Core Prompt Development

- [ ] Story initialization prompt
- [ ] Narrator response prompt
- [ ] Choice generation prompt
- [ ] Environment modification prompt
- [ ] Ending generation prompt
- [ ] Branch transition prompt
- [ ] Meta-commentary generation prompt
- [ ] Memory/flashback generation prompt

### 11.2 Infrastructure Setup

- [ ] LLM API integration
- [ ] Context management system
- [ ] Response parsing and validation
- [ ] Error handling and recovery
- [ ] Performance monitoring
- [ ] Content safety implementation
- [ ] Caching strategy for common responses
- [ ] Asynchronous processing pipeline

### 11.3 Testing Framework

- [ ] Unit tests for prompt templates
- [ ] Integration tests with narrative engine
- [ ] Performance benchmarking suite
- [ ] Edge case test suite
- [ ] User simulation testing
- [ ] Content safety verification
- [ ] Regression testing system
- [ ] Continuous evaluation pipeline

## Appendix A: Sample Prompt-Response Pairs

### A.1 Initialization Example

**Simplified Prompt:**

```
Create a narrative experience for a character named Alex Chen who works as a software developer at TechFusion Inc. Key life facts include winning a hackathon in college, recently being passed over for promotion, and having a passion for mountain hiking. The backstory mentions feeling increasingly disconnected from work purpose and noticing strange patterns in company behavior lately.
```

**Response:**

```json
{
  "title": "The Recursive Function",
  "openingNarration": "This is the story of Alex Chen, a software developer at TechFusion Inc., employee number 427. Alex sat at desk 427, writing code that would soon be integrated into TechFusion's mysterious Project Ascension. But on this particular Tuesday, something was different. The office was completely empty. No colleagues typing furiously at their keyboards, no project managers roaming the halls with worried expressions, not even the familiar sound of the coffee machine overworking itself in the break room. Just silence. 'Perhaps everyone is in the all-hands meeting,' Alex thought, though no such meeting appeared on the calendar. As Alex stood up from desk 427, ready to investigate, a calm voice began to narrate...",
  "environment": {
    "initialLocation": "Alex's cubicle at TechFusion Inc., featuring a dual-monitor setup, family photo, and a small potted plant that's somehow survived months of neglect.",
    "keyLocations": [
      {
        "name": "TechFusion Open Office",
        "description": "An open-plan office with rows of empty desks, abandoned coffee mugs, and screensavers bouncing across monitors.",
        "significance": "Starting point and representation of corporate uniformity",
        "personalConnectionPoint": "Desk contains hiking photo from Mt. Rainier trip"
      },
      {
        "name": "Executive Floor",
        "description": "Plush carpeting, wood-paneled walls, and a sense of privilege separate from the developer workspace below.",
        "significance": "Represents the hierarchy and promotion that eluded Alex",
        "personalConnectionPoint": "Promotion rejection letter visible on executive's desk"
      }
    ]
  },
  "narratorProfile": {
    "voice": "Calm, slightly sardonic, with moments of genuine curiosity about Alex's choices",
    "initialAttitude": "Gently guiding but allowing for defiance",
    "quirks": [
      "Occasionally references coding concepts as metaphors",
      "Has unusual knowledge of Alex's past"
    ],
    "evolutionFactors": [
      "Becomes more frustrated if defied repeatedly",
      "Grows more philosophical if Alex explores thoroughly"
    ]
  }
}
```

### A.2 Narrator Response Example

**Simplified Prompt:**

```
The player (Alex) has chosen to ignore the narrator's suggestion to check the conference room and instead has decided to examine the CEO's private office. The narrator previously established a lightly sarcastic but guiding relationship. This is the first major defiance of narrator instructions.
```

**Response:**

```json
{
  "narration": "I'm quite certain I suggested the conference room, and yet here was Alex, standing before the CEO's private office like a curious algorithm exploring unintended edge cases. How fascinating. That locked door had always been off-limits to regular developers – much like that promotion opportunity had seemed within reach until it wasn't. Well, since we're already deviating from the expected execution path, perhaps there's something worth discovering here. Though I should mention, choices like this tend to have... unexpected return values.",
  "tone": "amused_but_cautious",
  "significance": 4,
  "personalReferences": ["passed_over_promotion"],
  "suggestedEnvironmentChanges": [
    {
      "type": "visual",
      "target": "ceo_office_door",
      "description": "Door handle gleams with unusual intensity, as if inviting interaction"
    },
    {
      "type": "audio",
      "target": "environment",
      "description": "Subtle electronic humming becomes audible from within the office"
    }
  ],
  "followupPossibilities": [
    "Try to open the door despite lack of access",
    "Look for another way in",
    "Return to the suggested path",
    "Search for clues about the empty office"
  ],
  "internalNotes": "Player showing independent exploration tendency. Prepare branch shift toward 'corporate secrets' narrative path."
}
```

## Appendix B: Troubleshooting Common Issues

### B.1 Response Format Problems

| Issue              | Possible Cause                                      | Solution                                                |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------- |
| Malformed JSON     | Complex instructions overwhelming structured output | Simplify output format, provide clearer examples        |
| Missing Fields     | Insufficient emphasis on required elements          | Mark critical fields with [REQUIRED] tag                |
| Verbose Responses  | Insufficient length constraints                     | Add explicit token limits for each section              |
| Tone Inconsistency | Conflicting personality instructions                | Consolidate narrator characteristics, prioritize traits |

### B.2 Context Management Issues

| Issue                   | Possible Cause                         | Solution                                              |
| ----------------------- | -------------------------------------- | ----------------------------------------------------- |
| Context Amnesia         | Important details pushed out of window | Implement periodic context refreshing                 |
| Contradictory Responses | Conflicting information in context     | Implement consistency checking before generation      |
| Detail Overemphasis     | Repeated mentions in context           | Filter redundant information, balance emphasis        |
| Slow Response Time      | Excessive context length               | Optimize token usage, compress historical information |

### B.3 Narrative Quality Issues

| Issue                   | Possible Cause                     | Solution                                                   |
| ----------------------- | ---------------------------------- | ---------------------------------------------------------- |
| Predictable Choices     | Insufficient creativity parameters | Increase temperature, add explicit novelty instructions    |
| Shallow Personalization | Insufficient integration guidance  | Add specific personal detail connection requirements       |
| Railroading             | Over-constrained narrative options | Expand branch possibilities, reduce deterministic language |
| Tonal Whiplash          | Insufficient transition guidance   | Add emotional continuity requirements between responses    |

## Appendix C: Performance Optimization

### C.1 Response Time Improvement

- Implement caching for common narrator responses
- Pre-generate likely narrative branches during idle times
- Use streaming responses for immediate feedback
- Implement concurrent generation for multiple elements
- Optimize prompt length through compression techniques

### C.2 Cost Optimization

- Implement tiered generation strategy (simple responses use smaller models)
- Cache and reuse common environmental descriptions
- Batch related requests where possible
- Implement token budget monitoring and optimization
- Use fine-tuned smaller models for routine interactions
