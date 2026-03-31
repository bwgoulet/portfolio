'use client';

import { memo } from 'react';
import type { RefObject } from 'react';
import { Group } from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';

type CabinProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
  cabinRef: RefObject<Group | null>;
};

export const Cabin = memo(function Cabin({
  interactiveEnabled,
  hovered,
  onHoverChange,
  onClick,
  cabinRef
}: CabinProps) {
  return (
    <group ref={cabinRef} position={SCENE_ANCHORS.cabin} rotation={[0, -0.46, 0]}>
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.92, 1.1]} />
        <meshStandardMaterial color={PALETTE.cabinWall} flatShading />
      </mesh>
      <mesh position={[0, 1.12, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.18, 0.96, 4]} />
        <meshStandardMaterial color={PALETTE.cabinRoof} flatShading />
      </mesh>

      <mesh
        position={[0, 0.35, 0.58]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (interactiveEnabled) onHoverChange(true);
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHoverChange(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (interactiveEnabled) onClick();
        }}
      >
        <boxGeometry args={[0.36, 0.56, 0.06]} />
        <meshStandardMaterial
          color={PALETTE.cabinDoor}
          emissive={hovered ? '#6d4f2f' : '#17100a'}
          emissiveIntensity={hovered ? 0.26 : 0.05}
          flatShading
        />
      </mesh>

      <mesh position={[-0.3, 0.52, 0.57]}>
        <planeGeometry args={[0.22, 0.19]} />
        <meshBasicMaterial color="#d2bc90" />
      </mesh>
      <mesh position={[0.31, 0.52, 0.57]}>
        <planeGeometry args={[0.22, 0.19]} />
        <meshBasicMaterial color="#d2bc90" />
      </mesh>
    </group>
  );
});
