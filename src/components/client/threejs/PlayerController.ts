import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class PlayerController {
  private camera: THREE.PerspectiveCamera;
  private controls: PointerLockControls;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private canJump = false;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private prevTime = performance.now();
  private domElement: HTMLCanvasElement;

  // Collision detection properties
  private scene: THREE.Scene;
  private playerHeight = 1.6; // Typical eye level
  private playerRadius = 0.3; // Collision radius
  private raycaster = new THREE.Raycaster();
  private collisionDistance = 0.4; // Adjusted for more precise collision

  // Collision optimization
  private collisionObjects: THREE.Object3D[] = [];
  private collisionCheckInterval = 50; // Check more frequently
  private lastCollisionCheck = 0;

  // Added properties to prevent teleporting/jumping
  private maxSpeed = 40.0; // Max speed in units per second
  private maxDelta = 0.1; // Max time step to prevent large jumps in physics
  private lastPosition = new THREE.Vector3(); // Track previous position
  private isInitialized = false; // Flag to indicate first frame
  private roomBounds = {
    minX: -10,
    maxX: 10,
    minY: 0,
    maxY: 3,
    minZ: -10,
    maxZ: 10,
  };

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLCanvasElement,
    scene: THREE.Scene
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;
    this.controls = new PointerLockControls(this.camera, this.domElement);

    this.lastPosition.copy(this.camera.position);
    this.updateCollisionObjects();

    this.domElement.addEventListener('click', () => {
      this.controls.lock();
    });

    this.controls.addEventListener('lock', () => {
      console.log('Pointer locked');
    });

    this.controls.addEventListener('unlock', () => {
      console.log('Pointer unlocked');
    });

    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private updateCollisionObjects(): void {
    this.collisionObjects = [];
    this.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh && (object as THREE.Mesh).geometry) {
        this.collisionObjects.push(object);
      }
    });
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.controls.isLocked) return;

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  private checkCollision(movementDirection: THREE.Vector3): boolean {
    if (!this.scene || this.collisionObjects.length === 0) return false;

    const now = performance.now();
    // Perform check only if interval has passed or it's a significant movement
    if (
      now - this.lastCollisionCheck < this.collisionCheckInterval &&
      movementDirection.lengthSq() === 0
    ) {
      // If no significant movement and interval not passed, assume previous check is fine
      // This part needs careful handling or could return a stale "false"
      // For now, let's always proceed if there's an intent to move.
    }

    // Always perform the check if there's movement input, but update lastCollisionCheck time
    // The interval mainly helps reduce checks when idle or very minor adjustments.
    if (movementDirection.lengthSq() > 0) {
      this.lastCollisionCheck = now;
    } else if (now - this.lastCollisionCheck < this.collisionCheckInterval) {
      return false; // No movement and interval not passed, skip
    }

    const playerPosition = new THREE.Vector3();
    this.camera.getWorldPosition(playerPosition);
    // Consider raycasting from slightly lower to catch floor objects better if needed,
    // but playerHeight / 2 is generally good for mid-body.
    const raycastVerticalOffset = this.playerHeight / 2;

    // Reinstate 8 raycasts for better coverage
    const angles = [
      0,
      Math.PI / 4,
      Math.PI / 2,
      (3 * Math.PI) / 4,
      Math.PI,
      (5 * Math.PI) / 4,
      (3 * Math.PI) / 2,
      (7 * Math.PI) / 4,
    ];

    for (const angle of angles) {
      // Create a direction vector for the current angle, relative to player's facing direction.
      // This is for checking collisions in *all* directions around the player,
      // not just the intended movement direction.
      // For movement collision, we need a ray *in the direction of intended movement*.

      // The ray should be cast from the player's current position in the *intended* movement direction.
      const rayOrigin = new THREE.Vector3(
        playerPosition.x, // Origin is player's current x
        playerPosition.y - this.playerHeight + raycastVerticalOffset, // Origin is player's current y (mid-body)
        playerPosition.z // Origin is player's current z
      );

      // The raycaster needs the origin and the *normalized* direction of movement.
      this.raycaster.set(rayOrigin, movementDirection.clone().normalize());

      const intersections = this.raycaster.intersectObjects(
        this.collisionObjects,
        false // Do not check recursively, only direct objects in the list
      );

      if (
        intersections.length > 0 &&
        intersections[0].distance < this.collisionDistance
      ) {
        // console.log('Collision detected at distance:', intersections[0].distance, 'with object:', intersections[0].object.name);
        return true; // Collision detected
      }
    }
    return false; // No collision
  }

  private validatePosition(): void {
    const position = this.camera.position;
    const isValid =
      !isNaN(position.x) &&
      !isNaN(position.y) &&
      !isNaN(position.z) &&
      position.x >= this.roomBounds.minX &&
      position.x <= this.roomBounds.maxX &&
      position.y >= this.roomBounds.minY &&
      position.y <= this.roomBounds.maxY && // Keep Y check
      position.z >= this.roomBounds.minZ &&
      position.z <= this.roomBounds.maxZ;

    if (!isValid) {
      position.copy(this.lastPosition);
      this.velocity.set(0, 0, 0);
      console.warn(
        'Invalid position detected, resetting to',
        this.lastPosition
      );
    } else {
      this.lastPosition.copy(position);
    }
  }

  public update(): void {
    if (!this.isInitialized) {
      this.lastPosition.copy(this.camera.position);
      this.updateCollisionObjects(); // Ensure objects are loaded on first actual update
      this.isInitialized = true;
      return;
    }

    if (!this.controls.isLocked) {
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.velocity.x = 0;
      this.velocity.z = 0;
      return;
    }

    const time = performance.now();
    let delta = (time - this.prevTime) / 1000;
    delta = Math.min(delta, this.maxDelta);

    this.velocity.x -= this.velocity.x * 8.0 * delta;
    this.velocity.z -= this.velocity.z * 8.0 * delta;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    const speed = 20.0; // Slightly reduced speed for finer control

    let collidedX = false;
    let collidedZ = false;

    if (this.direction.x !== 0) {
      const moveDirectionX = new THREE.Vector3(-this.direction.x, 0, 0)
        .applyQuaternion(this.camera.quaternion)
        .setY(0) // Ensure movement is horizontal
        .normalize();
      if (this.checkCollision(moveDirectionX)) {
        this.velocity.x = 0; // Stop horizontal movement
        collidedX = true;
      }
    }

    if (this.direction.z !== 0) {
      const moveDirectionZ = new THREE.Vector3(0, 0, -this.direction.z)
        .applyQuaternion(this.camera.quaternion)
        .setY(0) // Ensure movement is horizontal
        .normalize();
      if (this.checkCollision(moveDirectionZ)) {
        this.velocity.z = 0; // Stop forward/backward movement
        collidedZ = true;
      }
    }

    if (!collidedX && this.direction.x !== 0) {
      this.velocity.x -= this.direction.x * speed * delta;
    }
    if (!collidedZ && this.direction.z !== 0) {
      this.velocity.z -= this.direction.z * speed * delta;
    }

    const currentSpeed = Math.sqrt(
      this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z
    );
    if (currentSpeed > this.maxSpeed) {
      const factor = this.maxSpeed / currentSpeed;
      this.velocity.x *= factor;
      this.velocity.z *= factor;
    }

    this.lastPosition.copy(this.camera.position);

    // Apply movement relative to camera orientation
    this.controls.moveRight(-this.velocity.x * delta);
    this.controls.moveForward(-this.velocity.z * delta);

    // Crucially, keep player Y position fixed to prevent flying/sinking due to minor look-up/down
    // This might need adjustment if actual jumping/crouching is added.
    // For now, we assume a fixed player height relative to the "floor".
    this.camera.position.y = this.playerHeight;

    this.validatePosition();
    this.prevTime = time;
  }

  public getControls(): PointerLockControls {
    return this.controls;
  }

  public dispose(): void {
    this.controls.dispose();
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
    // this.raycaster = null!; // Raycaster is not nullable if always new THREE.Raycaster()
    this.velocity.set(0, 0, 0);
    this.direction.set(0, 0, 0);
    this.collisionObjects = [];
  }
}
