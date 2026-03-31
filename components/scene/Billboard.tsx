'use client';

import { memo, useMemo } from 'react';
import type { RefObject } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { PALETTE } from '@/config/sceneConfig';
import { InteractionState } from './types';

type BillboardProps = {
  interactiveEnabled: boolean;
  interactionState: InteractionState;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
  billboardRef: RefObject<Group | null>;
};

export const BILLBOARD_ANCHOR: [number, number, number] = [1.2, 1.5, -0.8];

export const Billboard = memo(function Billboard({
  interactiveEnabled,
  interactionState,
  onHoverChange,
  onClick,
  billboardRef
}: BillboardProps) {
  const isHovered = interactionState === 'hoverBillboard';

  const faceMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: isHovered ? '#e0cfad' : PALETTE.billboardFace,
        flatShading: true,
        emissive: isHovered ? '#6b5a2b' : '#1f1a0f',
        emissiveIntensity: isHovered ? 0.28 : 0.05
      }),
    [isHovered]
  );

  return (
    <group ref={billboardRef} position={BILLBOARD_ANCHOR} rotation={[0, -0.33, 0]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.12, 1.4, 0.12]} />
        <meshStandardMaterial color={PALETTE.billboardFrame} flatShading />
      </mesh>

      <mesh
        position={[0, 1.32, 0.05]}
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
        <boxGeometry args={[1.45, 0.84, 0.12]} />
        <primitive object={faceMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 1.32, 0.12]}>
        <planeGeometry args={[1.18, 0.58]} />
        <meshBasicMaterial color={isHovered ? '#2c1f1f' : '#252220'} />
      </mesh>
    </group>
  );
});
