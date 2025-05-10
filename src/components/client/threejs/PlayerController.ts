import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class PlayerController {
  private camera: THREE.PerspectiveCamera;
  private controls: PointerLockControls;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private canJump = false; // Not implemented yet, but good to have
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private prevTime = performance.now();

  private domElement: HTMLCanvasElement;

  // Collision detection properties
  private scene: THREE.Scene;
  private playerHeight = 1.6; // Typical eye level
  private playerRadius = 0.3; // Collision radius
  private raycaster = new THREE.Raycaster();
  private collisionDistance = 0.5; // How close we can get to objects

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLCanvasElement,
    scene: THREE.Scene
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene; // Store scene reference for collision detection
    this.controls = new PointerLockControls(this.camera, this.domElement);

    // Add listeners for pointer lock
    this.domElement.addEventListener('click', () => {
      this.controls.lock();
    });

    this.controls.addEventListener('lock', () => {
      // You might want to display instructions or hide a menu here
      console.log('Pointer locked');
    });

    this.controls.addEventListener('unlock', () => {
      // You might want to show a menu or pause the game here
      console.log('Pointer unlocked');
    });

    // Keyboard controls
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
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
        // Basic jump, can be improved with physics
        // if (this.canJump === true) this.velocity.y += 350;
        // this.canJump = false;
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

  // Check if movement in a given direction would cause a collision
  private checkCollision(direction: THREE.Vector3): boolean {
    if (!this.scene) return false; // Safety check

    // Calculate player position (at feet level, not eye level)
    const playerPosition = new THREE.Vector3();
    this.camera.getWorldPosition(playerPosition);
    playerPosition.y -= this.playerHeight; // Adjust from eye level to feet level

    // Send rays in movement direction from a few points around the player
    // This creates a more robust collision detection than a single ray
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
      // Calculate ray origin point around player's cylinder
      const rayOrigin = new THREE.Vector3(
        playerPosition.x + Math.sin(angle) * this.playerRadius,
        playerPosition.y + this.playerHeight / 2, // Middle of player height
        playerPosition.z + Math.cos(angle) * this.playerRadius
      );

      // Set ray direction to movement direction
      this.raycaster.set(rayOrigin, direction.clone().normalize());

      // Check for intersections
      const intersections = this.raycaster.intersectObjects(
        this.scene.children,
        true
      );

      // If we found a close intersection, we have a collision
      if (
        intersections.length > 0 &&
        intersections[0].distance < this.collisionDistance
      ) {
        return true;
      }
    }

    return false;
  }

  public update(): void {
    if (!this.controls.isLocked) {
      // If pointer is not locked, reset movement flags and velocity to prevent drifting
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.velocity.x = 0;
      this.velocity.z = 0;
      return;
    }

    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;

    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    // this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize(); // this ensures consistent movements in all directions

    const speed = 40.0; // units per second

    // Convert direction to world space (adjusting for camera rotation)
    const moveDirection = new THREE.Vector3();
    if (this.moveForward || this.moveBackward) {
      moveDirection.z = -this.direction.z;
      moveDirection.applyQuaternion(this.camera.quaternion);
      moveDirection.y = 0; // Keep movement horizontal
      moveDirection.normalize();

      // Only apply movement if no collision is detected
      if (!this.checkCollision(moveDirection)) {
        this.velocity.z -= this.direction.z * speed * delta;
      }
    }

    if (this.moveLeft || this.moveRight) {
      moveDirection.x = -this.direction.x;
      moveDirection.applyQuaternion(this.camera.quaternion);
      moveDirection.y = 0; // Keep movement horizontal
      moveDirection.normalize();

      // Only apply movement if no collision is detected
      if (!this.checkCollision(moveDirection)) {
        this.velocity.x -= this.direction.x * speed * delta;
      }
    }

    this.controls.moveRight(-this.velocity.x * delta);
    this.controls.moveForward(-this.velocity.z * delta);

    // this.controls.getObject().position.y += (this.velocity.y * delta); // new behavior

    // if (this.controls.getObject().position.y < 1.6) { // Player height
    //   this.velocity.y = 0;
    //   this.controls.getObject().position.y = 1.6;
    //   this.canJump = true;
    // }

    this.prevTime = time;
  }

  public getControls(): PointerLockControls {
    return this.controls;
  }

  public dispose(): void {
    this.controls.dispose();
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
    // Remove click listener from domElement if it was added for locking
    // No explicit removal for domElement click, PointerLockControls handles its own listeners internally
    // Clean up collision detection resources
    this.raycaster = null!;
  }
}
