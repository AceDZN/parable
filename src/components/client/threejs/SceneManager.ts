import * as THREE from 'three';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mount: HTMLDivElement;

  constructor(mount: HTMLDivElement) {
    this.mount = mount;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.Fog(0xcccccc, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.mount.clientWidth / this.mount.clientHeight,
      0.1,
      1000
    );

    this.camera.position.set(-0.5, 1.6, 0.5);

    this.camera.lookAt(new THREE.Vector3(-0.7, 1.4, -1));

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.mount.appendChild(this.renderer.domElement);

    this.addLights();
  }

  private addLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffee, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    this.scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    this.scene.add(hemisphereLight);

    this.addOfficeLights();
  }

  private addOfficeLights(): void {
    const createCeilingLight = (x: number, z: number) => {
      const lightColor = 0xffffee;
      const pointLight = new THREE.PointLight(lightColor, 0.5, 8, 2);
      pointLight.position.set(x, 2.9, z);
      pointLight.castShadow = false;
      this.scene.add(pointLight);

      const lightFixture = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.6),
        new THREE.MeshBasicMaterial({ color: lightColor })
      );
      lightFixture.position.copy(pointLight.position);
      this.scene.add(lightFixture);
    };

    createCeilingLight(0, 0);
    createCeilingLight(-3, 3);
    createCeilingLight(3, 3);
    createCeilingLight(0, 6);
    createCeilingLight(-3, -3);
    createCeilingLight(3, -3);
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
  }

  public onWindowResize(): void {
    if (!this.mount) return;
    this.camera.aspect = this.mount.clientWidth / this.mount.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
  }

  public dispose(): void {
    this.renderer.dispose();
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

    if (this.renderer.domElement.parentNode === this.mount) {
      this.mount.removeChild(this.renderer.domElement);
    }
  }
}
