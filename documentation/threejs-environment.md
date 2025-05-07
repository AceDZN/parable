# Three.js Environment Creation Guide

## 1. Introduction

This guide outlines the implementation strategy for creating dynamic 3D environments in our narrative game using Three.js. The environment will serve as the visual foundation for player exploration and interaction, adapting based on user-provided content and narrative progression.

### 1.1 Guide Purpose

- Define architecture for 3D environment implementation
- Establish asset management strategy
- Document dynamic scene generation approach
- Outline performance optimization techniques
- Specify camera and movement control implementation

### 1.2 Environment Design Goals

- **Immersive First-Person Experience**: Create believable spaces that feel explorable
- **Dynamic Customization**: Adapt environment based on user-provided details
- **Narrative Integration**: Environment changes reflect story progression
- **Performance Optimization**: Ensure smooth experience across devices
- **Modularity**: Components that can be reused across different story environments

## 2. Architecture Overview

### 2.1 Component Hierarchy

The Three.js implementation follows this component structure:

```
ThreeJSEnvironment
├── SceneManager                 // Manages the overall scene and rendering
├── EnvironmentTemplate          // Base template for specific setting types
├── DynamicObjectSystem          // Handles interactive objects
├── EffectsSystem                // Visual effects for narrative emphasis
├── PlayerController             // Camera and movement system
├── InteractionSystem            // Handles object interactions
├── NarratorIntegration          // Visual elements for narrator presence
└── PerformanceOptimizer         // Handles LOD and optimization
```

### 2.2 Communication Flow

The Three.js environment communicates with other systems through:

1. **State Observer Pattern**: Environment subscribes to narrative state changes
2. **Event System**: Interactions trigger events for narrative processing
3. **Command Pattern**: Narrative engine sends commands to modify environment
4. **Asset Loading Pipeline**: Dynamic loading based on narrative requirements
5. **Animation Timeline**: Synced with narrator delivery and story beats

## 3. Environment Templates

### 3.1 Base Templates

Create these foundational environment templates matching user selection options:

1. **Corporate Office**

   - Reception area with customizable logo
   - Cubicle workspace with personalization points
   - Executive offices with status indicators
   - Conference rooms for key narrative moments
   - Break areas for casual exploration
   - Maintenance/server rooms for hidden content
   - Elevator and stairwell transition spaces

2. **Creative Studio**

   - Open plan work area with creative stations
   - Gallery/display spaces for visual content
   - Meeting pods and informal areas
   - Production rooms for specialized work
   - Storage areas with discoverable content
   - Outdoor or window views

3. **Academic Institution**

   - Classroom spaces with learning materials
   - Administrative offices with personalization
   - Research facilities with specialized equipment
   - Common areas for social narrative moments
   - Library or knowledge repository
   - Hidden areas for narrative discovery

4. **Tech Startup**

   - Modern open workspace with flexible zones
   - Server/technical areas with interactive systems
   - Lounge/game areas with casual atmosphere
   - Presentation space for narrative exposition
   - Private meeting rooms for key story moments
   - Roof/outdoor access for perspective shifts

5. **Government Facility**

   - Reception and security checkpoints
   - Administrative office spaces
   - Restricted access areas
   - Filing and record rooms
   - Conference and briefing rooms
   - Maintenance corridors and utility spaces

6. **Home Office**
   - Work area with personalization opportunities
   - Living spaces showing character aspects
   - Transition spaces to outdoors or fantasy elements
   - Storage areas with memory objects
   - Windows with significant views

### 3.2 Template Implementation Strategy

For each template:

1. **Core Mesh Structure**:

   - Basic architectural elements (walls, floors, ceilings)
   - Structural features (doors, windows, hallways)
   - Navigation paths and collision boundaries
   - Lighting attachment points
   - Interactive object zones

2. **Material Systems**:

   - Base material assignments
   - Customization parameters (colors, textures)
   - Dynamic material states (normal, highlighted, altered)
   - Reflective surfaces where appropriate
   - Transparent elements for glass/screens

3. **Layout Configuration**:

   - JSON-based layout definitions
   - Room connection mapping
   - Scale and proportion guidelines
   - Spawn point designations
   - Navigation mesh generation

4. **Personalization Points**:
   - Locations for user-uploaded images
   - Name/text integration surfaces
   - Color scheme customization
   - Object placement variation
   - Architectural style adaptation

## 4. Dynamic Scene Generation

### 4.1 Environment Initialization Process

1. **Template Selection**:

   - Choose base template from user environment preference
   - Apply mood/tone parameters to lighting and materials
   - Configure time period adjustments to objects and styles

2. **Layout Generation**:

   - Select room configurations based on narrative requirements
   - Arrange rooms according to exploration pacing needs
   - Generate procedural elements for variation (furniture arrangement, etc.)
   - Create transition spaces between core areas

3. **Personalization Integration**:

   - Process user-provided images to textures
   - Apply workplace name/logo to appropriate surfaces
   - Distribute personal elements based on life facts
   - Customize colors and materials based on preferences

4. **Narrative Setup**:
   - Place initial interactive objects
   - Set up trigger zones for key story moments
   - Initialize state-reactive objects
   - Establish hidden paths and secret areas

### 4.2 Custom Texture Processing

For user-uploaded images:

1. **Image Preparation**:

   - Resize to optimal texture dimensions (power of 2)
   - Generate mipmaps for distance rendering
   - Create normal maps for dimensional effects if appropriate
   - Apply color correction for environmental lighting

2. **Context-Specific Processing**:

   - Photo frames: Add physical frame and glass effects
   - Computer screens: Add screen glare and power state effects
   - Documents: Apply paper texture and shadowing
   - Environmental art: Integrate with surrounding materials

3. **Placement Strategy**:
   - Identify high-visibility locations for important images
   - Create clusters of related images where appropriate
   - Use images as narrative breadcrumbs for exploration
   - Place images to reward thorough exploration

### 4.3 Procedural Detail Generation

To create environmental uniqueness:

1. **Office Clutter System**:

   - Procedurally generate appropriate desk items
   - Distribute personal effects based on character details
   - Create document contents reflecting workplace
   - Add environmental storytelling elements

2. **Architectural Variation**:

   - Modular wall/floor/ceiling systems
   - Procedural damage or wear patterns
   - Lighting variation algorithms
   - Weather or time effects when appropriate

3. **Ambient Life Simulation**:
   - Subtle movement elements (papers, fans, screens)
   - Ambient particle systems (dust, air effects)
   - Light flicker or movement
   - Sound source placement

## 5. Object Interaction System

### 5.1 Interactive Object Types

Implement these core interactive object types:

1. **Inspectable**: Items that can be examined closely

   - Documents with readable text
   - Photos with detailed view
   - Objects with multiple inspection angles
   - Items with state memory (examined/unexamined)

2. **Operable**: Objects that can be activated

   - Doors, drawers, and containers
   - Buttons, switches, and levers
   - Computers and electronic devices
   - Mechanical systems and machines

3. **Collectible**: Items that can join inventory

   - Keys and access devices
   - Memory objects related to backstory
   - Evidence or narrative clues
   - Tools required for other interactions

4. **Environmental**: Background elements with state
   - Lights that can change state
   - Screens with changing content
   - Movable furniture or barriers
   - Weather or atmosphere systems

### 5.2 Interaction Implementation

For each object, implement:

1. **Raycast Detection System**:

   - Object highlighting on hover/proximity
   - Multiple interaction points on complex objects
   - Layer-based detection priorities
   - Distance-based interaction availability

2. **Interaction State Machine**:

   - Idle state with subtle animation
   - Highlighted state when selectable
   - Active state during interaction
   - Modified states after interaction
   - Disabled state when no longer interactive

3. **Interaction Feedback Systems**:

   - Visual highlight effect
   - Sound effect on interaction
   - Animation sequence
   - Particle effects when appropriate
   - Screen-space prompts and information

4. **Narrative Integration**:
   - Event dispatch to narrative engine
   - State memory for persistence
   - Conditional availability based on story state
   - Connection to narrator commentary trigger

### 5.3 Object Metadata Structure

Each interactive object contains:

```
{
  "objectId": "unique_identifier",
  "type": "inspectable|operable|collectible|environmental",
  "defaultState": "initial_state",
  "interactionPoints": [
    {
      "position": [x, y, z],
      "interactionType": "examine|activate|take|use",
      "requiredItem": "item_id or null",
      "narratorTrigger": "trigger_id or null"
    }
  ],
  "states": {
    "state_1": {
      "meshModifications": { ... },
      "materialModifications": { ... },
      "availableInteractions": [ ... ]
    },
    "state_2": { ... }
  },
  "narrativeData": {
    "description": "Object description",
    "significance": "Narrative significance",
    "personalConnection": "Connection to user backstory"
  }
}
```

## 6. Player Controller System

### 6.1 Camera Implementation

1. **First-Person Camera**:

   - Eye-level positioning (adjustable by setting)
   - Realistic field of view (60-75 degrees)
   - Subtle head bob during movement
   - Smooth acceleration/deceleration
   - Look limits for realistic neck movement

2. **Camera Effects**:

   - Subtle depth of field for focus
   - Chromatic aberration for emotional moments
   - Vignette effect for tension or clarity
   - Film grain for stylistic purposes
   - Bloom effects for emphasis

3. **Special Camera States**:
   - Inspection mode (when examining objects)
   - Cutscene mode (for scripted moments)
   - Choice mode (when making decisions)
   - Transition mode (between environments)

### 6.2 Movement Controls

1. **Core Movement System**:

   - WASD/Arrow keys for movement
   - Space for interaction (configurable)
   - Mouse look with sensitivity settings
   - Physics-based movement with inertia
   - Collision detection and resolution

2. **Movement States**:

   - Walking as primary movement
   - No running (consistent with narrative pacing)
   - Restricted movement during interactions
   - Complete stoppage during key narrative moments
   - Optional sitting/leaning for specific interactions

3. **Accessibility Considerations**:
   - Configurable movement speed
   - Toggle vs. hold options for actions
   - Alternative control schemes
   - Reduced motion settings
   - Auto-movement options for difficult navigation

### 6.3 Player Boundaries

1. **Navigation Constraint System**:

   - Invisible barriers at story boundaries
   - Narrator commentary on boundary attempts
   - Subtle visual cues for valid paths
   - Door locks and other narrative blockers
   - One-way transitions for story progression

2. **Collision System**:
   - Character collision capsule
   - Environment collision meshes
   - Sliding along surfaces
   - Step-up for small obstacles
   - Pushable objects where narratively appropriate

## 7. Environment Reactivity

### 7.1 State-Based Modifications

Implement these environmental change types:

1. **Visual State Changes**:

   - Lighting changes reflecting mood shifts
   - Material alterations showing story progression
   - Object appearance/disappearance
   - Texture swaps on surfaces
   - Structural changes in architecture

2. **Audio Environment Changes**:

   - Ambient sound adjustment
   - Positional audio source modification
   - Acoustic property changes
   - Music transitions tied to narrative
   - Silence zones for emphasis

3. **Physical Modifications**:
   - Door accessibility changes
   - Path alterations and new routes
   - Obstacle creation or removal
   - Gravity or physics modifications
   - Scale or proportion shifts

### 7.2 Trigger Systems

Implement environmental triggers through:

1. **Spatial Triggers**:

   - Volume-based activation zones
   - Line-of-sight triggers
   - Proximity detection
   - Direction-specific triggers
   - Multi-point activation areas

2. **Interaction Triggers**:

   - Object interaction consequences
   - Sequential activation puzzles
   - Time-delayed reactions
   - Conditional state changes
   - Chain reaction systems

3. **Narrative Triggers**:
   - Story state synchronization
   - Narrator comment triggers
   - Choice consequence visualization
   - Character detail integration moments
   - Meta-narrative environmental breaks

### 7.3 Transition Effects

For moving between states or areas:

1. **Visual Transitions**:

   - Fade effects (black, white, color)
   - Dissolve between states
   - Morphing geometry
   - Material transitions
   - Lighting shifts

2. **Spatial Transitions**:
   - Teleportation with appropriate effects
   - Elevator/stairwell loading transitions
   - Dream-sequence style transitions
   - Reality-breaking portal effects
   - Time-lapse environmental changes

## 8. Optimization Strategies

### 8.1 Asset Management

1. **Asset Loading Pipeline**:

   - Asynchronous loading system
   - Priority-based loading queue
   - Background preloading for upcoming areas
   - Memory management for disposed assets
   - Asset pooling for common elements

2. **Level of Detail (LOD) System**:

   - Multiple detail levels for complex objects
   - Distance-based mesh switching
   - Texture resolution management
   - Geometry simplification for distant objects
   - Shader complexity reduction based on distance

3. **Asset Categorization**:
   - Essential assets (always loaded)
   - Area-specific assets (loaded on demand)
   - Narrative-dependent assets (loaded based on choices)
   - Optional assets (loaded during idle time)
   - Fallback assets (simplified versions for performance)

### 8.2 Rendering Optimization

1. **Occlusion Culling**:

   - Room-based visibility system
   - Portal culling for doorways
   - Occlusion query system for complex scenes
   - Manual visibility toggles for narrative control
   - Distance-based culling thresholds

2. **Shader Optimization**:

   - Material batching for similar objects
   - Shader complexity levels based on hardware
   - Instancing for repeated elements
   - Deferred lighting for complex scenes
   - Custom shaders optimized for specific effects

3. **Draw Call Reduction**:
   - Mesh combining for static elements
   - Texture atlasing for material reduction
   - Instance rendering for repeated objects
   - Billboard techniques for distant details
   - Particle system optimization

### 8.3 Performance Monitoring

1. **Metrics Tracking**:

   - FPS counter with warning thresholds
   - Draw call monitoring
   - Memory usage tracking
   - Asset loading time measurement
   - Physics performance evaluation

2. **Adaptive Quality**:

   - Dynamic resolution scaling
   - Effect complexity adjustment
   - Draw distance adaptation
   - Reflection quality scaling
   - Shadow resolution and distance adjustment

3. **Fallback Systems**:
   - Simplified rendering mode for low-end devices
   - Critical feature prioritization
   - Asynchronous physics calculations
   - Reduced animation complexity
   - Text-focused alternative for very low performance

## 9. Special Effects Systems

### 9.1 Narrative Emphasis Effects

1. **Focus Effects**:

   - Depth of field highlighting important elements
   - Subtle glow or outline for key objects
   - Color saturation changes for emphasis
   - Time dilation during significant moments
   - Sound dampening for focused attention

2. **Emotional State Visualization**:

   - Color grading shifts matching narrative tone
   - Particle effects representing mental states
   - Screen-space effects for intense moments
   - Environment distortion for surreal sequences
   - Post-processing for memory or dream sequences

3. **Meta-Narrative Visualization**:
   - Reality-breaking visual glitches
   - Fourth-wall breaking perspective shifts
   - Interface element integration into world
   - Developer "note" visual style
   - Game construction visualization

### 9.2 Environmental Effects

1. **Lighting Effects**:

   - Dynamic time of day simulation
   - Mood lighting for emotional emphasis
   - Flickering or unstable lights for tension
   - God rays and volumetric lighting
   - Dynamic shadows for movement perception

2. **Atmosphere Effects**:

   - Dust particles in air
   - Fog or mist systems
   - Air distortion effects
   - Weather simulations when appropriate
   - Temperature visualization (cold breath, heat waves)

3. **Surface Effects**:
   - Material response to narrative (aging, changing)
   - Dynamic wetness or moisture
   - Dust accumulation or cleanliness variation
   - Wear patterns developing over time
   - Reactive materials (footprints, touch marks)

## 10. Audio Integration

### 10.1 Spatial Audio System

1. **Audio Positioning**:

   - 3D positional audio for sound sources
   - Room acoustics simulation
   - Distance-based attenuation
   - Material-based sound propagation
   - Obstacle occlusion effects on sound

2. **Ambient Sound Design**:

   - Layered ambient background system
   - Location-specific sound profiles
   - Time-varying ambient patterns
   - Mood-responsive sound adjustments
   - Transition blending between areas

3. **Interactive Audio Sources**:
   - Object interaction sounds
   - Footstep system with material response
   - Mechanical sound systems (machines, computers)
   - Environmental reaction sounds
   - Character-generated subtle sounds

### 10.2 Narrator Audio Integration

1. **Voice Playback System**:

   - Synced text and audio delivery
   - Spatial positioning options for narrator
   - Volume balancing with environment sounds
   - Interruption handling for player actions
   - Emotional tone adjustment effects

2. **Narrator Audio Effects**:
   - Reverb variations based on environment
   - Processing effects for different narrator states
   - Spatial movement of narrator voice
   - Layering for meta-narrative moments
   - Filtering for memory or dream sequences

## 11. Integration with Narrative Engine

### 11.1 State Synchronization

1. **Observer Pattern Implementation**:

   - Environment subscribes to narrative state changes
   - Component-specific state reaction registration
   - Targeted state update messaging
   - Batch update system for complex changes
   - State validation and error recovery

2. **State Change Visualization**:
   - Visual feedback for state transitions
   - Appropriate timing for state-triggered events
   - Queueing system for multiple state changes
   - Transition effects between major states
   - Fallback visualization for undefined states

### 11.2 Event Dispatch

1. **Interaction Event System**:

   - Standardized event format for narrative engine
   - Event categorization (exploration, interaction, observation)
   - Detailed interaction data packaging
   - Timestamp and duration tracking
   - Event priority system for simultaneous actions

2. **Response Handling**:
   - Callback registration for narrative responses
   - Timed execution of environment changes
   - Conditional execution based on narrative state
   - Animation and effect triggering
   - Error handling for failed responses

### 11.3 Narrative Visualization

1. **Choice Visualization**:

   - Environmental emphasis of choice points
   - Visual representation of decision consequences
   - Path indication for available options
   - Subtle guidance toward narrative-important elements
   - "Memory" visualization of past choices

2. **Personal Detail Integration**:
   - Strategic placement of personal elements
   - Highlighting system for personal connections
   - Visual themes matching backstory elements
   - Recurring motifs from user-provided details
   - Environmental storytelling using character background

## 12. Testing and Debugging

### 12.1 Environment Testing Tools

1. **Visualization Helpers**:

   - Collision mesh visualization
   - Trigger zone highlighting
   - Navigation path display
   - Performance metrics overlay
   - State tracking display

2. **Interactive Testing**:

   - Free camera mode for environment inspection
   - Object state manual override
   - Time scaling for animation testing
   - Lighting condition adjustment
   - Narrative state jumping

3. **Automated Testing**:
   - Camera path recording and playback
   - Performance benchmark sequences
   - Asset loading stress tests
   - Interaction sequence automation
   - Cross-device simulation

### 12.2 Common Issues and Solutions

1. **Performance Problems**:

   - Draw call optimization techniques
   - Texture memory management
   - Physics simplification options
   - Render pipeline simplification
   - Asset streaming adjustment

2. **Visual Glitches**:

   - Z-fighting resolution strategies
   - Material sorting fixes
   - Shadow acne prevention
   - Texture bleeding solutions
   - Animation blending corrections

3. **Interaction Issues**:
   - Raycast debugging approaches
   - Collision resolution improvements
   - Interaction timing adjustments
   - Event propagation verification
   - State synchronization repair

## 13. Implementation Checklist

### 13.1 Foundational Systems

- [ ] Basic Three.js setup with renderer, scene, and camera
- [ ] Asset loading pipeline implementation
- [ ] Environment template structure definition
- [ ] Player controller with first-person camera
- [ ] Interaction system with raycasting
- [ ] State management connection to narrative engine
- [ ] Performance monitoring and optimization systems

### 13.2 Environment Creation

- [ ] Corporate Office template implementation
- [ ] Creative Studio template implementation
- [ ] Academic Institution template implementation
- [ ] Tech Startup template implementation
- [ ] Government Facility template implementation
- [ ] Home Office template implementation
- [ ] Transition spaces between environment types

### 13.3 Interactive Elements

- [ ] Inspectable object system
- [ ] Operable object implementation
- [ ] Collectible item framework
- [ ] Environmental state change system
- [ ] User-image integration pipeline
- [ ] Narrator trigger zone implementation
- [ ] Choice point visualization system

### 13.4 Special Features

- [ ] Meta-narrative visual effects
- [ ] Environmental reactivity systems
- [ ] Character detail visualization framework
- [ ] Narrative branch visualization
- [ ] State transition effect system
- [ ] Accessibility features implementation
- [ ] Performance scaling system

## Appendix A: Asset Requirements

### A.1 Base Environment Assets

For each environment template:

- Wall, floor, ceiling variations (3-5 types each)
- Door and window variations (2-3 types each)
- Furniture appropriate to setting (10-15 key pieces)
- Lighting fixtures (5-8 variations)
- Decorative elements (15-20 options)
- Structural elements specific to environment

### A.2 Interactive Object Assets

- Computer/electronic devices (5-8 variations)
- Document and paper items (10-15 types)
- Container objects (5-8 variations)
- Control interface elements (switches, buttons, etc.)
- Personal items (photos, keepsakes, etc.)
- Narrative-specific special objects

### A.3 Effect Assets

- Particle textures for various effects
- Transition effect materials
- Post-processing effect assets
- Sound effect library
- Material variations for state changes
- Lighting effect assets

## Appendix B: Performance Targets

| Device Class | Target FPS | Max Draw Calls | Texture Memory | Poly Count | Quality Level |
| ------------ | ---------- | -------------- | -------------- | ---------- | ------------- |
| High-end PC  | 60+ fps    | 500-1000       | 2-4 GB         | 1-3M       | Ultra         |
| Mid-range PC | 60 fps     | 300-500        | 1-2 GB         | 500K-1M    | High          |
| Low-end PC   | 30-60 fps  | 200-300        | 512MB-1GB      | 250-500K   | Medium        |
| Older PC     | 30 fps     | 100-200        | 256-512MB      | 100-250K   | Low           |
| Fallback     | 20-30 fps  | <100           | <256MB         | <100K      | Minimal       |
