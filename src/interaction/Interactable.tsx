import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractionCategory, InteractableConfig } from './types';
import { interactionRegistry } from './InteractionRegistry';
import { useStore } from '../store';

export interface InteractableProps extends Partial<InteractableConfig> {
  id: string;
  name: string;
  category: InteractionCategory;
  children?: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export const Interactable: React.FC<InteractableProps> = ({
  id,
  name,
  category,
  children,
  position,
  rotation,
  scale,
  materialType,
  hardness,
  dropItem,
  tooltip,
  wobbleOnClick = true,
  onHover,
  onClick,
  onRightClick,
  onHold,
  onDrag,
  onBreak,
  customData,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isWobbling, setIsWobbling] = useState(false);
  const wobbleStartTime = useRef(0);
  const holdTimer = useRef<number | null>(null);
  const worldResetKey = useStore((s) => s.worldResetKey);

  const config: InteractableConfig = useMemo(
    () => ({
      id,
      name,
      category,
      materialType,
      hardness,
      dropItem,
      tooltip,
      wobbleOnClick,
      onHover,
      onClick,
      onRightClick,
      onHold,
      onDrag,
      onBreak,
      customData,
    }),
    [
      id,
      name,
      category,
      materialType,
      hardness,
      dropItem,
      tooltip,
      wobbleOnClick,
      onHover,
      onClick,
      onRightClick,
      onHold,
      onDrag,
      onBreak,
      customData,
    ]
  );

  // Register with InteractionRegistry
  useEffect(() => {
    if (groupRef.current) {
      interactionRegistry.register(groupRef.current, config);
      // Ensure all children meshes have userData.interactable
      groupRef.current.traverse((child) => {
        if ((child as any).isMesh || (child as any).isPoints || (child as any).isLine) {
          child.userData.interactable = config;
        }
      });
    }
    return () => {
      if (groupRef.current) {
        interactionRegistry.unregister(groupRef.current);
      }
    };
  }, [config]);

  // World Reset listener: restore visibility
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.visible = true;
      groupRef.current.traverse((child) => {
        child.visible = true;
        if ((child as any).isMesh || (child as any).isPoints || (child as any).isLine) {
          child.userData.interactable = config;
        }
      });
    }
  }, [worldResetKey, config]);

  // Ensure newly rendered children have userData.interactable
  useFrame(() => {
    if (groupRef.current && groupRef.current.children.length > 0 && !groupRef.current.children[0].userData?.interactable) {
      groupRef.current.traverse((child) => {
        if ((child as any).isMesh || (child as any).isPoints || (child as any).isLine) {
          child.userData.interactable = config;
        }
      });
    }
  });

  // Click wobble spring animation
  useFrame((_, delta) => {
    if (!groupRef.current || !isWobbling) return;
    const elapsed = (Date.now() - wobbleStartTime.current) / 1000;
    if (elapsed > 0.35) {
      setIsWobbling(false);
      groupRef.current.scale.set(1, 1, 1);
    } else {
      // Damped spring pulse
      const factor = 1 + Math.sin(elapsed * Math.PI * 8) * 0.08 * (1 - elapsed / 0.35);
      groupRef.current.scale.set(factor, factor, factor);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (category === 'BLOCK') {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = 'pointer';
    }
    if (config.onHover) {
      config.onHover(e);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    useStore.getState().setHoverTarget(null);
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    interactionRegistry.cancelMining();
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    // Start hold timer for mining blocks
    if (category === 'BLOCK' && groupRef.current) {
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      interactionRegistry.startMining(groupRef.current, worldPos, config);

      const startTime = Date.now();
      const duration = config.hardness || 450;
      const isPickaxe = useStore.getState().selectedHotbarSlot === 0;
      const actualDuration = isPickaxe ? duration * 0.35 : duration;

      const interval = setInterval(() => {
        const progress = (Date.now() - startTime) / actualDuration;
        if (progress >= 1) {
          clearInterval(interval);
          interactionRegistry.completeMining(groupRef.current!);
        } else {
          interactionRegistry.updateMiningProgress(progress);
        }
      }, 40);

      const stopMining = () => {
        clearInterval(interval);
        interactionRegistry.cancelMining();
        window.removeEventListener('pointerup', stopMining);
      };
      window.addEventListener('pointerup', stopMining, { once: true });
    }
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (wobbleOnClick) {
      setIsWobbling(true);
      wobbleStartTime.current = Date.now();
    }
    if (config.onClick) {
      config.onClick(e);
    }
  };

  const handleContextMenu = (e: any) => {
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.preventDefault();
    if (config.onRightClick) {
      config.onRightClick(e);
    } else if (category === 'BLOCK') {
      // Right-click block placement
      const sound = (config.materialType || 'stone') as 'stone' | 'wood' | 'dirt';
      interactionRegistry.spawnDrop(config.dropItem || 'dirt', [
        groupRef.current?.position.x || 0,
        (groupRef.current?.position.y || 0) + 1,
        groupRef.current?.position.z || 0,
      ]);
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {children}
    </group>
  );
};
