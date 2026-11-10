import React from 'react';
import { Billboard, Text } from '@react-three/drei';

interface NametagProps {
  name: string;
  position?: [number, number, number];
}

export const Nametag: React.FC<NametagProps> = ({ name, position = [0, 34, 0] }) => {
  return (
    <Billboard position={position} follow={true}>
      {/* Semi-transparent dark background */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[name.length * 1.5 + 4, 4.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* Minecraft white pixel text */}
      <Text
        fontSize={2.5}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.25}
        outlineColor="#111111"
      >
        {name}
      </Text>
    </Billboard>
  );
};
