'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { PlayerController } from './PlayerController';

// We will create CorporateOfficeEnvironment later
// import { CorporateOfficeEnvironment } from './environments/CorporateOfficeEnvironment';

interface ThreeJSEnvironmentProps {
  // Story data can be passed here later for personalization
  // storyData: any;
}

export const ThreeJSEnvironment: React.FC<ThreeJSEnvironmentProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const playerControllerRef = useRef<PlayerController | null>(null);
  // const officeEnvironmentRef = useRef<CorporateOfficeEnvironment | null>(null);

  const initializeScene = useCallback(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Initialize SceneManager
    const sceneManager = new SceneManager(currentMount);
    sceneManagerRef.current = sceneManager;

    // Initialize PlayerController
    const playerController = new PlayerController(
      sceneManager.getCamera(),
      sceneManager.getRenderer().domElement
    );
    playerControllerRef.current = playerController;

    // Initialize and add environment (example)
    // For now, let's add a simple cube to verify setup
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.5; // Place it on the ground
    sceneManager.getScene().add(cube);

    // Add a simple ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    sceneManager.getScene().add(ground);

    // officeEnvironmentRef.current = new CorporateOfficeEnvironment(sceneManager.getScene());
    // officeEnvironmentRef.current.load();

    // Start animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      playerController.update(); // Update player controls
      sceneManager.render();
    };

    animate();

    // Resize listener
    const handleResize = () => {
      if (sceneManager) {
        sceneManager.onWindowResize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      if (playerControllerRef.current) {
        playerControllerRef.current.dispose();
      }
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
      if (currentMount && sceneManagerRef.current) {
        // Check if domElement exists before trying to remove
        if (
          sceneManagerRef.current.getRenderer().domElement.parentNode ===
          currentMount
        ) {
          currentMount.removeChild(
            sceneManagerRef.current.getRenderer().domElement
          );
        }
      }
      sceneManagerRef.current = null;
      playerControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;
    if (typeof window !== 'undefined') {
      // Ensure this runs only on the client
      cleanupFunction = initializeScene();
    }
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [initializeScene]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};
