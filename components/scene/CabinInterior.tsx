'use client';

import { memo } from 'react';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';

const PHOTO_LAYOUT = [
  [-0.52, 1.42, -0.56],
  [-0.3, 1.56, -0.56],
  [-0.08, 1.44, -0.56],
  [0.14, 1.58, -0.56],
  [0.36, 1.45, -0.56],
  [0.58, 1.56, -0.56],
  [-0.4, 1.22, -0.56],
  [-0.16, 1.1, -0.56],
  [0.08, 1.24, -0.56],
  [0.32, 1.1, -0.56],
  [0.54, 1.25, -0.56]
] as const;

const PHOTO_COLORS = VISUAL_TOKENS.scene.cabinInterior.photoPalette;

export const CabinInterior = memo(function CabinInterior() {
  const { cabinInterior } = VISUAL_TOKENS.scene;
  return (
    <group position={SCENE_ANCHORS.cabin} rotation={[0, -0.46, 0]}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1.28, 0.04, 1.02]} />
        <meshStandardMaterial color={cabinInterior.floor} flatShading />
      </mesh>

      <mesh position={[0, 0.94, -0.54]} receiveShadow>
        <boxGeometry args={[1.28, 1.8, 0.08]} />
        <meshStandardMaterial color={cabinInterior.wallBack} flatShading />
      </mesh>

      <mesh position={[-0.58, 0.94, 0]} receiveShadow>
        <boxGeometry args={[0.08, 1.8, 1.02]} />
        <meshStandardMaterial color={cabinInterior.wallSide} flatShading />
      </mesh>

      <mesh position={[0.2, 0.42, -0.42]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.08, 0.28]} />
        <meshStandardMaterial color={cabinInterior.tableTop} flatShading />
      </mesh>
      {[-0.06, 0.05, 0.46].map((x) => (
        <mesh key={x} position={[x, 0.23, -0.46]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 0.38, 0.06]} />
          <meshStandardMaterial color={cabinInterior.tableLeg} flatShading />
        </mesh>
      ))}

      <mesh position={[0.23, 0.56, -0.42]} castShadow>
        <boxGeometry args={[0.28, 0.2, 0.18]} />
        <meshStandardMaterial color={cabinInterior.monitorBody} flatShading />
      </mesh>
      <mesh position={[0.23, 0.55, -0.315]}>
        <planeGeometry args={[0.2, 0.12]} />
        <meshBasicMaterial color={cabinInterior.monitorScreen} />
      </mesh>

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
