import * as THREE from 'three';
import { InteractableConfig } from './types';
import { interactionRegistry } from './InteractionRegistry';

/**
 * Creates and registers an interactable object with universal categories and default behaviors.
 * Direct scene.add of visible meshes without registration is banned.
 */
export function createInteractable<T extends THREE.Object3D>(
  object: T,
  config: InteractableConfig
): T {
  interactionRegistry.register(object, config);
  return object;
}
