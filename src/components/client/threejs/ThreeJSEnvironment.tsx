'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { PlayerController } from './PlayerController';
import { CorporateOfficeEnvironment } from './environments/CorporateOfficeEnvironment';
import { GUI } from 'lil-gui';

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
  const officeEnvironmentRef = useRef<CorporateOfficeEnvironment | null>(null);
  const guiRef = useRef<GUI | null>(null);

  const initializeScene = useCallback(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Initialize GUI
    const gui = new GUI();
    guiRef.current = gui;

    // Initialize SceneManager
    const sceneManager = new SceneManager(currentMount);
    sceneManagerRef.current = sceneManager;

    // Initialize PlayerController
    const playerController = new PlayerController(
      sceneManager.getCamera(),
      sceneManager.getRenderer().domElement,
      sceneManager.getScene()
    );
    playerControllerRef.current = playerController;

    // Initialize and load the office environment, passing the GUI instance
    const officeEnv = new CorporateOfficeEnvironment(
      sceneManager.getScene(),
      gui
    );
    officeEnv.load();
    officeEnvironmentRef.current = officeEnv;

    // Remove placeholder cube and ground - the environment handles its own floor
    const placeholderCube = sceneManager
      .getScene()
      .getObjectByName('PlaceholderCube');
    if (placeholderCube) sceneManager.getScene().remove(placeholderCube);
    const placeholderGround = sceneManager
      .getScene()
      .getObjectByName('PlaceholderGround');
    if (placeholderGround) sceneManager.getScene().remove(placeholderGround);

    // Start animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      playerController.update(); // Update player controls
      sceneManager.render();
    };

    animate();

    // Resize listener
    const handleResize = () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.onWindowResize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      if (playerControllerRef.current) {
        playerControllerRef.current.dispose();
      }
      if (officeEnvironmentRef.current) {
        officeEnvironmentRef.current.dispose(); // Dispose of environment assets
      }
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
      // No need to removeChild here if SceneManager.dispose() handles it
      // and mountRef might be unmounted by React anyway
      sceneManagerRef.current = null;
      playerControllerRef.current = null;
      officeEnvironmentRef.current = null;
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
