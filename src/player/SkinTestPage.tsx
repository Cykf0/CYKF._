import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { PlayerModel } from './PlayerModel';
import { content } from '../content';

export const SkinTestPage: React.FC = () => {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialAngle = (searchParams?.get('angle') as 'front' | 'side' | 'back' | 'isometric') || 'isometric';
  const initialPose = (searchParams?.get('pose') as 'idle' | 'walking' | 'waving' | 'look-back') || 'idle';
  const initialItem = searchParams?.get('item') || 'diamond-pickaxe';

  const [pose, setPose] = useState<'idle' | 'walking' | 'waving' | 'look-back'>(initialPose);
  const [heldItem, setHeldItem] = useState<string>(initialItem);
  const [cameraPreset, setCameraPreset] = useState<'front' | 'side' | 'back' | 'isometric'>(initialAngle);

  // Camera presets
  const cameraConfig = {
    front: { position: [0, 1.1, 4.8] as [number, number, number], fov: 42 },
    side: { position: [4.8, 1.1, 0] as [number, number, number], fov: 42 },
    back: { position: [0, 1.1, -4.8] as [number, number, number], fov: 42 },
    isometric: { position: [3.2, 2.2, 4.0] as [number, number, number], fov: 42 }
  }[cameraPreset];

  return (
    <div className="relative w-screen h-screen bg-[#111216] text-white flex flex-col select-none overflow-hidden font-body">
      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-white/20 bg-black/40 flex items-center justify-center overflow-hidden">
            <img src="/skins/cykf.png" alt="Skin Avatar" className="w-8 h-8 pixelated object-cover object-top" />
          </div>
          <div>
            <h1 className="font-pixel text-xs text-mc-village tracking-wider">
              PLAYER SKIN VERIFICATION · STEP 3
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Player: <span className="text-white font-semibold">{content.mcUsername}</span> | Owner: <span className="text-white font-semibold">{content.owner}</span> | File: <span className="text-mc-cherry">{content.skinPath}</span>
            </p>
          </div>
        </div>

        {/* Quick Angle Preset Buttons */}
        <div className="flex items-center gap-2">
          {(['front', 'side', 'back', 'isometric'] as const).map((angle) => (
            <button
              key={angle}
              onClick={() => setCameraPreset(angle)}
              className={`px-3 py-1.5 text-xs uppercase font-pixel tracking-wider mc-button ${
                cameraPreset === angle ? 'bg-[#555] border-white text-mc-village' : ''
              }`}
            >
              {angle}
            </button>
          ))}
        </div>
      </header>

      {/* 3D Canvas Viewport */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: cameraConfig.position, fov: cameraConfig.fov }}
          key={cameraPreset}
          className="w-full h-full"
        >
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 4, -5]} intensity={0.8} color="#B388FF" />

          {/* Minecraft stone ground grid */}
          <Grid
            renderOrder={-1}
            position={[0, 0, 0]}
            infiniteGrid
            cellSize={0.5}
            cellThickness={0.5}
            sectionSize={2}
            sectionThickness={1}
            cellColor="#26262b"
            sectionColor="#40404a"
            fadeDistance={25}
          />

          {/* Player Center Stage */}
          <Suspense fallback={null}>
            <group position={[0, 0, 0]}>
              <PlayerModel
                skinUrl="/skins/cykf.png"
                pose={pose}
                heldItem={heldItem}
                scale={0.065}
                cursorTracking={true}
              />
            </group>
          </Suspense>

          <OrbitControls
            target={[0, 1.0, 0]}
            enablePan={false}
            minDistance={1.2}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        </Canvas>

        {/* Orbit instruction overlay */}
        <div className="absolute top-20 right-4 z-20 pointer-events-none bg-black/40 backdrop-blur-sm px-3 py-2 border border-white/10 text-[11px] text-gray-300 rounded">
          <p className="font-pixel text-[10px] text-mc-village mb-1">INTERACTIVE CONTROLS</p>
          <p>• Drag mouse to orbit 360°</p>
          <p>• Scroll to zoom</p>
          <p>• Head tracks cursor position</p>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#16161a]/90 backdrop-blur-md p-3 border border-white/15 flex flex-wrap items-center gap-6 shadow-2xl mc-panel">
        {/* Pose Selection */}
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[10px] text-gray-400">POSE:</span>
          {(['idle', 'walking', 'waving', 'look-back'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPose(p)}
              className={`px-2.5 py-1 text-[11px] uppercase mc-button ${
                pose === p ? 'border-white text-mc-village font-bold' : ''
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-6 bg-white/15" />

        {/* Held Item Selection */}
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[10px] text-gray-400">HELD ITEM:</span>
          {[
            { id: 'diamond-pickaxe', label: 'Pickaxe' },
            { id: 'torch', label: 'Torch' },
            { id: 'soul-lantern', label: 'Lantern' },
            { id: 'emerald', label: 'Emerald' },
            { id: 'book', label: 'Book' },
            { id: 'ender-pearl', label: 'Pearl' },
            { id: 'none', label: 'None' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setHeldItem(item.id)}
              className={`px-2 py-1 text-[11px] mc-button ${
                heldItem === item.id ? 'border-white text-mc-village font-bold' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
