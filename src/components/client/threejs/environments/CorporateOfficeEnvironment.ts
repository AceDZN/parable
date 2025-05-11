import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';

export class CorporateOfficeEnvironment {
  private scene: THREE.Scene;
  private loader: GLTFLoader;
  private officeEnvironmentGLBPath =
    '/3d-models/office_environment/office_1.glb'; // Path to your exported GLB
  private gui?: GUI;
  private officeGUIRootFolder?: GUI;

  // Array to hold meshes that should be considered for collision
  public collisionMeshes: THREE.Mesh[] = [];
  private loadedOfficeScene?: THREE.Group; // To keep a reference to the loaded scene for disposal

  // Tracking created materials that might need explicit disposal if not part of GLB
  private createdMaterials: THREE.Material[] = [];

  constructor(scene: THREE.Scene, gui?: GUI) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.gui = gui;

    if (this.gui) {
      this.officeGUIRootFolder = this.gui.addFolder(
        'Office Environment Controls'
      );
      // We can add controls for the entire loaded environment if needed, e.g., visibility, position
    }
  }

  // Helper to add transform controls if needed for the entire loaded scene
  private addTransformControls(
    folder: GUI,
    model: THREE.Object3D,
    modelName?: string
  ): GUI {
    const targetFolder = modelName ? folder.addFolder(modelName) : folder;
    targetFolder.add(model.position, 'x', -20, 20, 0.1).name('Pos X').listen();
    targetFolder.add(model.position, 'y', -20, 20, 0.1).name('Pos Y').listen();
    targetFolder.add(model.position, 'z', -20, 20, 0.1).name('Pos Z').listen();
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

  public load(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        this.officeEnvironmentGLBPath,
        (gltf) => {
          this.loadedOfficeScene = gltf.scene;
          this.loadedOfficeScene.name = 'LoadedOfficeEnvironment';

          // Optional: Adjust position, rotation, scale of the entire loaded scene if needed
          // e.g., this.loadedOfficeScene.scale.set(1, 1, 1);
          // e.g., this.loadedOfficeScene.position.set(0, 0, 0);

          this.collisionMeshes = []; // Clear previous collision meshes

          this.loadedOfficeScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              // Enable shadows for all meshes in the environment
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              // Check for custom property "isCollider" set in Blender
              // Custom properties from Blender are usually in `userData`
              if (mesh.userData && mesh.userData.isCollider === true) {
                this.collisionMeshes.push(mesh);
                console.log('Found collision mesh:', mesh.name, mesh.userData);
              }
            }
          });

          this.scene.add(this.loadedOfficeScene);

          if (this.officeGUIRootFolder && this.loadedOfficeScene) {
            this.addTransformControls(
              this.officeGUIRootFolder,
              this.loadedOfficeScene,
              'Entire Office'
            );
          }

          console.log('Office environment GLB loaded successfully.');
          console.log(
            'Number of collision meshes identified:',
            this.collisionMeshes.length
          );
          resolve();
        },
        (xhr) => {
          // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading office environment GLB:', error);
          reject(error);
        }
      );
    });
  }

  public dispose(): void {
    if (this.loadedOfficeScene) {
      // Traverse and dispose of geometries and materials specific to the loaded scene
      this.loadedOfficeScene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
      this.scene.remove(this.loadedOfficeScene);
      this.loadedOfficeScene = undefined;
      console.log('Disposed of loaded office environment.');
    }

    this.collisionMeshes = [];

    // Dispose of any other materials created by this class
    this.createdMaterials.forEach((material) => {
      material.dispose();
    });
    this.createdMaterials = [];

    // Clean up GUI
    if (this.officeGUIRootFolder) {
      this.officeGUIRootFolder.destroy();
      this.officeGUIRootFolder = undefined;
    }
  }
}
