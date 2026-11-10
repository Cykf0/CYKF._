import * as THREE from 'three';

export type InteractionCategory =
  | 'BLOCK'
  | 'PLANT'
  | 'MOB'
  | 'PROP'
  | 'LIGHT_SOURCE'
  | 'ITEM'
  | 'LIQUID'
  | 'PARTICLE'
  | 'STRUCTURE'
  | 'SKY'
  | 'UI'
  | 'PLAYER';

export interface InteractableConfig {
  id: string;
  name: string;
  category: InteractionCategory;
  sceneIndex?: number;
  materialType?: 'stone' | 'wood' | 'grass' | 'gravel' | 'snow';
  hardness?: number; // Break duration in milliseconds (default: 450)
  dropItem?: string;
  isGravityBlock?: boolean;
  tooltip?: string;
  wobbleOnClick?: boolean;
  onHover?: (e?: any) => void;
  onClick?: (e?: any) => void;
  onRightClick?: (e?: any) => void;
  onHold?: (e?: any) => void;
  onDrag?: (e?: any) => void;
  onBreak?: () => void;
  customData?: any;
}

export interface MiningState {
  objectId: string;
  position: THREE.Vector3;
  stage: number; // 0 to 9
  progress: number; // 0 to 1
  startTime: number;
  duration: number;
  blockConfig: InteractableConfig;
}

export interface FlyingDrop {
  id: string;
  itemType: string;
  startPos: [number, number, number];
  startTime: number;
}

export interface XpOrbData {
  id: string;
  startPos: [number, number, number];
  startTime: number;
}
