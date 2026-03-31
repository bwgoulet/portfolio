'use client';

import { memo } from 'react';
import type { RefObject } from 'react';
import { Group } from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';

type BillboardProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
  billboardRef: RefObject<Group | null>;
};

export const Billboard = memo(function Billboard({
  interactiveEnabled,
  hovered,
  onHoverChange,
  onClick,
  billboardRef
}: BillboardProps) {
  return (
    <group ref={billboardRef} position={SCENE_ANCHORS.billboard} rotation={[0, 0.42, 0]}>
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.15, 1.6, 0.15]} />
        <meshStandardMaterial color={PALETTE.billboardFrame} flatShading />
      </mesh>

      <mesh
        position={[0, 1.62, 0.06]}
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
        castShadow
      >
        <boxGeometry args={[2.25, 1.25, 0.12]} />
        <meshStandardMaterial
          color={hovered ? '#e2cfab' : PALETTE.billboardFace}
          emissive={hovered ? '#4a3b1f' : '#1f180f'}
          emissiveIntensity={hovered ? 0.3 : 0.09}
          flatShading
        />
      </mesh>

      {[
        [-0.62, 1.76, 0.14],
        [-0.01, 1.82, 0.14],
        [0.61, 1.7, 0.14],
        [-0.33, 1.37, 0.14],
        [0.34, 1.42, 0.14]
      ].map((position, idx) => (
        <mesh key={idx} position={position as [number, number, number]} rotation={[0, 0, (idx - 2) * 0.06]}>
          <planeGeometry args={[0.42, 0.33]} />
          <meshBasicMaterial color={idx % 2 === 0 ? '#f2d882' : '#f3c4a1'} />
        </mesh>
      ))}
    </group>
  );
});
