'use client';

import { memo } from 'react';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';

const PHOTO_LAYOUT = [
  [-0.64, 1.42, -0.78],
  [-0.38, 1.56, -0.78],
  [-0.12, 1.44, -0.78],
  [0.14, 1.58, -0.78],
  [0.4, 1.45, -0.78],
  [0.66, 1.56, -0.78],
  [-0.5, 1.22, -0.78],
  [-0.22, 1.1, -0.78],
  [0.06, 1.24, -0.78],
  [0.34, 1.1, -0.78],
  [0.62, 1.25, -0.78]
] as const;

const PHOTO_COLORS = VISUAL_TOKENS.scene.cabinInterior.photoPalette;

export const CabinInterior = memo(function CabinInterior() {
  const { cabinInterior } = VISUAL_TOKENS.scene;
  return (
    <group position={SCENE_ANCHORS.cabin} rotation={[0, -0.46, 0]} scale={1.28}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1.86, 0.04, 1.52]} />
        <meshStandardMaterial color={cabinInterior.floor} flatShading />
      </mesh>

      <mesh position={[0, 0.94, -0.8]} receiveShadow>
        <boxGeometry args={[1.86, 1.8, 0.08]} />
        <meshStandardMaterial color={cabinInterior.wallBack} flatShading />
      </mesh>

      <mesh position={[-0.89, 0.94, -0.08]} receiveShadow>
        <boxGeometry args={[0.08, 1.8, 1.52]} />
        <meshStandardMaterial color={cabinInterior.wallSide} flatShading />
      </mesh>

      <mesh position={[0.89, 0.94, -0.08]} receiveShadow>
        <boxGeometry args={[0.08, 1.8, 1.52]} />
        <meshStandardMaterial color={cabinInterior.wallSide} flatShading />
      </mesh>

      <mesh position={[0, 1.82, -0.08]} receiveShadow>
        <boxGeometry args={[1.86, 0.08, 1.52]} />
        <meshStandardMaterial color={cabinInterior.wallSide} flatShading />
      </mesh>

      <mesh position={[-0.67, 0.42, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.08, 0.86]} />
        <meshStandardMaterial color={cabinInterior.tableTop} flatShading />
      </mesh>
      {[-0.44, -0.16, 0.12].map((z) => (
        <mesh key={z} position={[-0.71, 0.23, z]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 0.38, 0.06]} />
          <meshStandardMaterial color={cabinInterior.tableLeg} flatShading />
        </mesh>
      ))}

      <group position={[-0.67, 0.56, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.2, 0.18]} />
          <meshStandardMaterial color={cabinInterior.monitorBody} flatShading />
        </mesh>
        <mesh position={[0, -0.01, 0.095]}>
          <planeGeometry args={[0.2, 0.12]} />
          <meshBasicMaterial color={cabinInterior.monitorScreen} />
        </mesh>
      </group>

      {PHOTO_LAYOUT.map((position, index) => (
        <group key={`${position[0]}-${position[1]}`} position={position} rotation={[0, 0, (index % 3 - 1) * 0.08]}>
          <mesh>
            <planeGeometry args={[0.16, 0.11]} />
            <meshBasicMaterial color={PHOTO_COLORS[index % PHOTO_COLORS.length]} />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[0.175, 0.125]} />
            <meshStandardMaterial color={PALETTE.cabinWall} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
});
