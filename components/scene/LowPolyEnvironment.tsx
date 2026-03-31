'use client';

import { PALETTE } from '@/config/sceneConfig';

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 0.8, 6]} />
        <meshStandardMaterial color={PALETTE.trunk} flatShading />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <coneGeometry args={[0.36, 0.9, 7]} />
        <meshStandardMaterial color={PALETTE.leaves} flatShading />
      </mesh>
    </group>
  );
}

function Rock({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial color={PALETTE.rock} flatShading />
    </mesh>
  );
}

export function LowPolyEnvironment() {
  return (
    <group>
      <mesh rotation={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[4.8, 5.8, 1.8, 7]} />
        <meshStandardMaterial color={PALETTE.islandSide} flatShading />
      </mesh>

      <mesh position={[0, 0.95, 0]} rotation={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[4.9, 5.9, 0.2, 7]} />
        <meshStandardMaterial color={PALETTE.islandTop} flatShading />
      </mesh>

      <mesh position={[0.4, 1.05, -0.6]} rotation={[-Math.PI / 2, 0.24, 0]} receiveShadow>
        <ringGeometry args={[0.6, 2.4, 7]} />
        <meshStandardMaterial color={PALETTE.path} flatShading side={2} />
      </mesh>

      <Tree position={[-1.8, 1.08, -0.7]} />
      <Tree position={[-2.7, 1.05, -1.7]} />
      <Tree position={[-0.8, 1.12, -2.4]} />
      <Tree position={[2.8, 1.04, -1.3]} />

      <Rock position={[2.5, 1.2, 1.4]} scale={[1.3, 1.4, 1.1]} />
      <Rock position={[-3.1, 1.2, 0.4]} scale={[1.1, 1.2, 1.4]} />
      <Rock position={[0.2, 1.07, 2.2]} scale={[0.8, 0.7, 0.8]} />
    </group>
  );
}
