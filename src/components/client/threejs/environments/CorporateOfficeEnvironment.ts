import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';

export class CorporateOfficeEnvironment {
  private scene: THREE.Scene;
  private loader: GLTFLoader;
  private modelsPath = '/3d-models/';
  private gui?: GUI;
  private officeGUIRootFolder?: GUI;
  private genericCubiclesGUIRootFolder?: GUI;
  private debugCollisionObjects: boolean = false; // Set to true to debug collision objects

  // Tracking created objects for proper cleanup
  private createdMeshes: THREE.Mesh[] = [];
  private createdMaterials: THREE.Material[] = [];

  private defaultTransforms = {
    desk: {
      position: new THREE.Vector3(-0.77, 0.48, -0.19),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1.6, 1.6, 1.6),
    },
    crtMonitor: {
      position: new THREE.Vector3(0, 0.48, -0.3), // Relative to desk
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(0.4, 0.4, 0.4),
    },
    chair: {
      position: new THREE.Vector3(0, 0.49, 0.099), // Relative to cubicle group
      rotation: new THREE.Euler(0, 2.8, 0),
      scale: new THREE.Vector3(1, 1, 1),
    },
  };

  // Default cubicle dimensions (can be overridden or made configurable)
  private cubicleSettings = {
    width: 2.5, // x-axis
    depth: 2.0, // z-axis
    wallHeight: 1.5, // y-axis
    wallThickness: 0.05,
    wallMaterial: new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2,
    }),
  };

  // Room settings
  private roomSettings = {
    width: 12, // x-axis
    depth: 16, // z-axis
    height: 3, // y-axis
    wallThickness: 0.25,
    wallMaterial: new THREE.MeshStandardMaterial({
      color: 0xecebeb,
      roughness: 0.7,
      metalness: 0.1,
    }),
    floorMaterial: new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.8,
      side: THREE.DoubleSide,
    }),
    doorWidth: 1.2,
    doorHeight: 2.4,
    doorwayPositions: [
      // Main entrance at front of room
      { x: 0, z: -8, rotation: 0, doorHeight: 2.4, doorWidth: 1.2 },
      // Side exit
      { x: 6, z: 0, rotation: Math.PI / 2, doorHeight: 2.4, doorWidth: 1.0 },
    ],
  };

  constructor(scene: THREE.Scene, gui?: GUI) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.createdMaterials.push(
      this.cubicleSettings.wallMaterial,
      this.roomSettings.wallMaterial,
      this.roomSettings.floorMaterial
    );

    this.gui = gui;
    if (this.gui) {
      this.officeGUIRootFolder = this.gui.addFolder(
        'Office Environment Controls'
      );
      this.genericCubiclesGUIRootFolder = this.gui.addFolder(
        'Generic Cubicles Controls'
      );
      this.genericCubiclesGUIRootFolder.close();
    }
  }

  private addTransformControls(
    folder: GUI,
    model: THREE.Object3D,
    modelName?: string
  ): GUI {
    const targetFolder = modelName ? folder.addFolder(modelName) : folder;
    targetFolder.add(model.position, 'x', -10, 10, 0.01).name('Pos X').listen();
    targetFolder.add(model.position, 'y', -5, 5, 0.01).name('Pos Y').listen();
    targetFolder.add(model.position, 'z', -10, 10, 0.01).name('Pos Z').listen();
    targetFolder
      .add(model.rotation, 'x', -Math.PI, Math.PI, 0.01)
      .name('Rot X')
      .listen();
    targetFolder
      .add(model.rotation, 'y', -Math.PI, Math.PI, 0.01)
      .name('Rot Y')
      .listen();
    targetFolder
      .add(model.rotation, 'z', -Math.PI, Math.PI, 0.01)
      .name('Rot Z')
      .listen();
    targetFolder.add(model.scale, 'x', 0.1, 5, 0.01).name('Scale X').listen();
    targetFolder.add(model.scale, 'y', 0.1, 5, 0.01).name('Scale Y').listen();
    targetFolder.add(model.scale, 'z', 0.1, 5, 0.01).name('Scale Z').listen();
    return targetFolder;
  }

  private createCubiclePartitionWalls(
    cubicleGroup: THREE.Group,
    parentGUIFolder?: GUI
  ): void {
    const { width, depth, wallHeight, wallThickness, wallMaterial } =
      this.cubicleSettings;
    let wallsFolder: GUI | undefined;
    if (parentGUIFolder) {
      wallsFolder = parentGUIFolder.addFolder('Cubicle Walls');
    }

    // Back Wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(width, wallHeight, wallThickness),
      wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -depth / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    backWall.name = 'CubicleBackWall';
    cubicleGroup.add(backWall);
    this.createdMeshes.push(backWall);
    if (wallsFolder)
      this.addTransformControls(wallsFolder, backWall, 'Back Wall');

    // Left Wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, depth),
      wallMaterial
    );
    leftWall.position.set(-width / 2 + wallThickness / 2, wallHeight / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    leftWall.name = 'CubicleLeftWall';
    cubicleGroup.add(leftWall);
    this.createdMeshes.push(leftWall);
    if (wallsFolder)
      this.addTransformControls(wallsFolder, leftWall, 'Left Wall');

    // Right Wall
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, depth),
      wallMaterial
    );
    rightWall.position.set(width / 2 - wallThickness / 2, wallHeight / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    rightWall.name = 'CubicleRightWall';
    cubicleGroup.add(rightWall);
    this.createdMeshes.push(rightWall);
    if (wallsFolder)
      this.addTransformControls(wallsFolder, rightWall, 'Right Wall');
  }

  private createRoom(): void {
    const {
      width,
      depth,
      height,
      wallThickness,
      wallMaterial,
      floorMaterial,
      doorwayPositions,
    } = this.roomSettings;
    const roomFolder = this.officeGUIRootFolder?.addFolder('Room');

    // Room center is at origin (0,0,0)
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = 'OfficeFloor';
    this.scene.add(floor);
    this.createdMeshes.push(floor);

    // Create room walls
    const createWall = (
      name: string,
      dimensions: { width: number; height: number; depth: number },
      position: { x: number; y: number; z: number },
      rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
    ) => {
      const geometry = new THREE.BoxGeometry(
        dimensions.width,
        dimensions.height,
        dimensions.depth
      );
      const wall = new THREE.Mesh(geometry, wallMaterial);
      wall.position.set(position.x, position.y, position.z);
      wall.rotation.set(rotation.x, rotation.y, rotation.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      wall.name = name;
      this.scene.add(wall);
      this.createdMeshes.push(wall);
      if (roomFolder) this.addTransformControls(roomFolder, wall, name);

      if (this.debugCollisionObjects) {
        // Add debug wireframe to visualize collision objects
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
        });
        const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
        wireframe.position.copy(wall.position);
        wireframe.rotation.copy(wall.rotation);
        this.scene.add(wireframe);
        this.createdMeshes.push(wireframe);
        this.createdMaterials.push(wireframeMaterial);
      }

      return wall;
    };

    // Function to create a wall with a doorway
    const createWallWithDoorway = (
      name: string,
      wallWidth: number,
      doorWidth: number,
      doorHeight: number,
      position: { x: number; y: number; z: number },
      rotationY: number = 0
    ) => {
      const wallHeight = height;
      const topHeight = wallHeight - doorHeight;

      // Calculate the part widths
      const leftWidth = (wallWidth - doorWidth) / 2;
      const rightWidth = (wallWidth - doorWidth) / 2;

      // Create wall sections
      // Left section
      if (leftWidth > 0) {
        createWall(
          `${name}_Left`,
          { width: leftWidth, height: wallHeight, depth: wallThickness },
          {
            x:
              position.x -
              (wallWidth / 2 - leftWidth / 2) * Math.cos(rotationY),
            y: wallHeight / 2,
            z:
              position.z -
              (wallWidth / 2 - leftWidth / 2) * Math.sin(rotationY),
          },
          { x: 0, y: rotationY, z: 0 }
        );
      }

      // Right section
      if (rightWidth > 0) {
        createWall(
          `${name}_Right`,
          { width: rightWidth, height: wallHeight, depth: wallThickness },
          {
            x:
              position.x +
              (wallWidth / 2 - rightWidth / 2) * Math.cos(rotationY),
            y: wallHeight / 2,
            z:
              position.z +
              (wallWidth / 2 - rightWidth / 2) * Math.sin(rotationY),
          },
          { x: 0, y: rotationY, z: 0 }
        );
      }

      // Top section (over the doorway)
      if (topHeight > 0) {
        createWall(
          `${name}_Top`,
          { width: doorWidth, height: topHeight, depth: wallThickness },
          {
            x: position.x,
            y: wallHeight - topHeight / 2,
            z: position.z,
          },
          { x: 0, y: rotationY, z: 0 }
        );
      }
    };

    // Create the walls without doorways
    // Front Wall (z positive, with doorway)
    const frontWallPos = { x: 0, y: height / 2, z: depth / 2 };
    createWallWithDoorway(
      'FrontWall',
      width,
      doorwayPositions[0].doorWidth,
      doorwayPositions[0].doorHeight,
      frontWallPos,
      0
    );

    // Back Wall (z negative)
    createWall(
      'BackWall',
      { width: width, height: height, depth: wallThickness },
      { x: 0, y: height / 2, z: -depth / 2 }
    );

    // Left Wall (x negative, with doorway)
    createWall(
      'LeftWall',
      { width: depth, height: height, depth: wallThickness },
      { x: -width / 2, y: height / 2, z: 0 },
      { x: 0, y: Math.PI / 2, z: 0 }
    );

    // Right Wall (x positive, with doorway)
    const rightWallPos = { x: width / 2, y: height / 2, z: 0 };
    createWallWithDoorway(
      'RightWall',
      depth,
      doorwayPositions[1].doorWidth,
      doorwayPositions[1].doorHeight,
      rightWallPos,
      Math.PI / 2
    );
  }

  public load(): void {
    // Create the room
    this.createRoom();

    // Create protagonist's cubicle
    this.createProtagonistCubicle();

    // Define cubicle layout - increased row spacing
    const cubicleSpacingX = this.cubicleSettings.width + 0.3; // Spacing along x-axis
    const cubicleSpacingZ = this.cubicleSettings.depth + 2.0; // Increased spacing between rows as requested

    // Create a row of cubicles in front of protagonist
    this.createGenericCubicle(
      1,
      new THREE.Vector3(-cubicleSpacingX, 0, cubicleSpacingZ)
    );
    this.createGenericCubicle(2, new THREE.Vector3(0, 0, cubicleSpacingZ));
    this.createGenericCubicle(
      3,
      new THREE.Vector3(cubicleSpacingX, 0, cubicleSpacingZ)
    );

    // Optionally add cubicles behind protagonist (commenting out for now)
    // this.createGenericCubicle(4, new THREE.Vector3(-cubicleSpacingX, 0, -cubicleSpacingZ), Math.PI);
    // this.createGenericCubicle(5, new THREE.Vector3(0, 0, -cubicleSpacingZ), Math.PI);
    // this.createGenericCubicle(6, new THREE.Vector3(cubicleSpacingX, 0, -cubicleSpacingZ), Math.PI);
  }

  private createCubicleContents(
    parentGroup: THREE.Group,
    parentGUIFolder?: GUI,
    isProtagonist: boolean = false
  ): void {
    const deskFolder = parentGUIFolder
      ? this.addTransformControls(parentGUIFolder, new THREE.Object3D(), 'Desk')
      : undefined;
    // deskFolder will receive actual desk controls after loading
    this.loader.load(
      `${this.modelsPath}table_cabinet_1.glb`,
      (gltfDesk) => {
        const desk = gltfDesk.scene;
        desk.name = 'Desk';
        desk.position.copy(this.defaultTransforms.desk.position);
        desk.rotation.copy(this.defaultTransforms.desk.rotation);
        desk.scale.copy(this.defaultTransforms.desk.scale);
        desk.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        parentGroup.add(desk);
        if (deskFolder) {
          // Now update the controls to target the loaded desk
          deskFolder.controllers.forEach((c) => c.destroy()); // Clear placeholder controls
          this.addTransformControls(deskFolder, desk); // Add controls for actual desk
        }

        const monitorLabel = isProtagonist
          ? 'CRT Monitor (on Desk)'
          : 'CRT Monitor';
        const monitorFolder = deskFolder
          ? this.addTransformControls(
              deskFolder,
              new THREE.Object3D(),
              monitorLabel
            )
          : undefined;
        this.loader.load(
          `${this.modelsPath}crt_monitor_1.glb`,
          (gltfMonitor) => {
            const monitor = gltfMonitor.scene;
            monitor.name = 'CRTMonitor';
            monitor.position.copy(this.defaultTransforms.crtMonitor.position);
            monitor.rotation.copy(this.defaultTransforms.crtMonitor.rotation);
            monitor.scale.copy(this.defaultTransforms.crtMonitor.scale);
            monitor.traverse((node) => {
              if ((node as THREE.Mesh).isMesh) {
                node.castShadow = true;
              }
            });
            desk.add(monitor);
            if (monitorFolder) {
              monitorFolder.controllers.forEach((c) => c.destroy());
              this.addTransformControls(monitorFolder, monitor);
            }
          },
          undefined,
          (error) => console.error('Error loading monitor for cubicle:', error)
        );
      },
      undefined,
      (error) => console.error('Error loading desk for cubicle:', error)
    );

    const chairLabel = 'Office Chair';
    const chairFolder = parentGUIFolder
      ? this.addTransformControls(
          parentGUIFolder,
          new THREE.Object3D(),
          chairLabel
        )
      : undefined;
    this.loader.load(
      `${this.modelsPath}office_chair.glb`,
      (gltfChair) => {
        const chair = gltfChair.scene;
        chair.name = 'OfficeChair';
        chair.position.copy(this.defaultTransforms.chair.position);
        chair.rotation.copy(this.defaultTransforms.chair.rotation);
        chair.scale.copy(this.defaultTransforms.chair.scale);
        chair.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        parentGroup.add(chair);
        if (chairFolder) {
          chairFolder.controllers.forEach((c) => c.destroy());
          this.addTransformControls(chairFolder, chair);
        }
      },
      undefined,
      (error) => console.error('Error loading chair for cubicle:', error)
    );

    // Add partition walls for this cubicle
    this.createCubiclePartitionWalls(parentGroup, parentGUIFolder);
  }

  private createProtagonistCubicle(): void {
    const cubicleName = 'Protagonist Cubicle';
    let cubicleGroupFolder = this.officeGUIRootFolder?.addFolder(cubicleName);

    const cubicleGroup = new THREE.Group();
    cubicleGroup.name = cubicleName; // Use consistent name for retrieval
    if (cubicleGroupFolder)
      this.addTransformControls(cubicleGroupFolder, cubicleGroup);
    else console.warn('GUI not available for Protagonist Cubicle controls.');

    this.createCubicleContents(cubicleGroup, cubicleGroupFolder, true);
    this.scene.add(cubicleGroup);
  }

  private createGenericCubicle(
    instanceNumber: number,
    basePosition: THREE.Vector3,
    rotationY: number = 0
  ): void {
    const cubicleName = `Generic Cubicle ${instanceNumber}`;
    let genericCubicleFolder =
      this.genericCubiclesGUIRootFolder?.addFolder(cubicleName);

    const cubicleGroup = new THREE.Group();
    cubicleGroup.name = `GenericCubicle_${instanceNumber}`; // Unique name for scene graph
    cubicleGroup.position.copy(basePosition);
    cubicleGroup.rotation.y = rotationY;
    if (genericCubicleFolder)
      this.addTransformControls(genericCubicleFolder, cubicleGroup);
    else console.warn(`GUI not available for ${cubicleName} controls.`);

    this.createCubicleContents(cubicleGroup, genericCubicleFolder);
    this.scene.add(cubicleGroup);
  }

  public dispose(): void {
    // Dispose of protagonist and generic cubicles by looking for them in the scene
    const removeModelRecursively = (object: THREE.Object3D) => {
      // First, remove all children recursively
      while (object.children.length > 0) {
        removeModelRecursively(object.children[0]);
      }

      // If it's a mesh, dispose of geometries and materials
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }

      // Remove the object from its parent
      if (object.parent) {
        object.parent.remove(object);
      }
    };

    // Get all objects that start with the name "Cubicle" or "Room" to clean them up
    const objectsToRemove: THREE.Object3D[] = [];
    this.scene.traverse((object) => {
      const name = object.name.toLowerCase();
      if (
        name.includes('cubicle') ||
        name.includes('wall') ||
        name === 'officefloor'
      ) {
        objectsToRemove.push(object);
      }
    });

    // Remove all identified objects
    objectsToRemove.forEach((obj) => {
      removeModelRecursively(obj);
    });

    // Dispose of all created meshes
    this.createdMeshes.forEach((mesh) => {
      if (mesh.geometry) mesh.geometry.dispose();
      // Materials are handled separately
      this.scene.remove(mesh);
    });

    // Dispose of all tracked materials
    this.createdMaterials.forEach((material) => {
      material.dispose();
    });

    // Clear arrays
    this.createdMeshes = [];
    this.createdMaterials = [];
  }
}
