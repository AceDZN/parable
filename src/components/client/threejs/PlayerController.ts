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

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement) {
    this.camera = camera;
    this.domElement = domElement;
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

    if (this.moveForward || this.moveBackward)
      this.velocity.z -= this.direction.z * speed * delta;
    if (this.moveLeft || this.moveRight)
      this.velocity.x -= this.direction.x * speed * delta;

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
  }
}
