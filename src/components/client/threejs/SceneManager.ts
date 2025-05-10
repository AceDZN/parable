import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mount: HTMLDivElement;
  private stats?: Stats; // Performance monitor
  private lights: THREE.Light[] = [];
  private showStats: boolean = true; // Set to false in production

  constructor(mount: HTMLDivElement) {
    this.mount = mount;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);

    // Reduce fog distance for performance (less to render)
    this.scene.fog = new THREE.Fog(0xcccccc, 15, 30);

    // Create perspective camera with a better starting position for the office environment
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.mount.clientWidth / this.mount.clientHeight,
      0.1,
      50 // Reduce far plane for better performance
    );

    // Position camera at floor level, a bit away from the desk
    this.camera.position.set(-2.5, 1.6, 2.5);
    this.camera.lookAt(new THREE.Vector3(-0.7, 1.4, -1));

    // Set up renderer with performance optimizations
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    // Optimize shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better quality/performance balance
    this.renderer.shadowMap.autoUpdate = false; // Only update shadows when necessary

    // Add renderer to DOM
    this.mount.appendChild(this.renderer.domElement);

    // Add performance stats if enabled
    if (this.showStats) {
      this.stats = new Stats();
      this.stats.dom.style.position = 'absolute';
      this.stats.dom.style.top = '0px';
      this.stats.dom.style.left = '0px';
      this.mount.appendChild(this.stats.dom);
    }

    this.addLights();

    // Initial shadow update
    this.renderer.shadowMap.needsUpdate = true;
  }

  private addLights(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Main directional light (like sun through windows) - OPTIMIZED
    const directionalLight = new THREE.DirectionalLight(0xffffee, 0.8);
    directionalLight.position.set(5, 10, 7.5);

    // Optimize shadow maps
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024; // Reduced for performance
    directionalLight.shadow.mapSize.height = 1024;

    // Tighten shadow camera frustum for better shadow quality at lower resolution
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 30;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;

    // Add shadow optimization
    directionalLight.shadow.bias = -0.001; // Reduce shadow acne

    this.scene.add(directionalLight);
    this.lights.push(directionalLight);

    // Hemisphere light for better environment lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    this.scene.add(hemisphereLight);
    this.lights.push(hemisphereLight);

    // Add some office fluorescent lighting - fewer lights, optimized
    this.addOfficeLights();
  }

  private addOfficeLights(): void {
    // Create fewer ceiling lights for better performance
    const createCeilingLight = (x: number, z: number) => {
      const lightColor = 0xffffee;
      const pointLight = new THREE.PointLight(lightColor, 0.5, 8, 2);
      pointLight.position.set(x, 2.9, z);
      pointLight.castShadow = false; // Don't cast shadows from point lights (performance)
      this.scene.add(pointLight);
      this.lights.push(pointLight);

      // Use instanced meshes for light fixtures if many are needed
      const lightFixture = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.6),
        new THREE.MeshBasicMaterial({ color: lightColor })
      );
      lightFixture.position.copy(pointLight.position);
      this.scene.add(lightFixture);
    };

    // Fewer lights, more strategically placed
    createCeilingLight(0, 0);
    createCeilingLight(-4, 4);
    createCeilingLight(4, 4);
    createCeilingLight(0, -4);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
    if (this.stats) this.stats.update();
  }

  public onWindowResize(): void {
    if (!this.mount) return;
    this.camera.aspect = this.mount.clientWidth / this.mount.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
  }

  // Call this occasionally to update shadows (not every frame)
  public updateShadows(): void {
    this.renderer.shadowMap.needsUpdate = true;
  }

  public dispose(): void {
    // Dispose of Three.js resources
    this.renderer.dispose();

    // Dispose of stats if used
    if (this.stats && this.stats.dom.parentNode) {
      this.stats.dom.parentNode.removeChild(this.stats.dom);
    }

    // Clean up lights
    this.lights.forEach((light) => {
      this.scene.remove(light);
    });
    this.lights = [];

    // Traverse and dispose of all scene objects
    this.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => material.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });

    // Clean up DOM element
    if (this.renderer.domElement.parentNode === this.mount) {
      this.mount.removeChild(this.renderer.domElement);
    }
  }
}
