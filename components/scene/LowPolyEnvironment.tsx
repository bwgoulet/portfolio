'use client';

import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import type { RefObject } from 'react';
import type { Group } from 'three';
import type { InteractiveTarget } from './types';

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.82, 6]} />
        <meshStandardMaterial color={PALETTE.trunk} flatShading />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <coneGeometry args={[0.38, 0.92, 7]} />
        <meshStandardMaterial color={PALETTE.leaves} flatShading />
      </mesh>
    </group>
  );
}

type StoneTabletsProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: (target: InteractiveTarget) => void;
};

function StoneTablets({ interactiveEnabled, hovered, onHoverChange, onClick }: StoneTabletsProps) {
  return (
    <group>
      {Array.from({ length: 4 }).map((_, index) => {
        const x = SCENE_ANCHORS.tabletsStart[0] + index * 0.62;
        const z = SCENE_ANCHORS.tabletsStart[2] + index * 0.14;
        const height = 0.88 + index * 0.08;

        return (
          <group key={index} position={[x, SCENE_ANCHORS.tabletsStart[1], z]}>
            <mesh
              castShadow
              receiveShadow
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
                if (interactiveEnabled) onClick('tablets');
              }}
            >
              <capsuleGeometry args={[0.17, height, 4, 6]} />
              <meshStandardMaterial
                color={hovered ? '#9da3a6' : PALETTE.tablet}
                emissive={hovered ? '#49605a' : '#1e2322'}
                emissiveIntensity={hovered ? 0.28 : 0.08}
                flatShading
              />
            </mesh>
            <mesh position={[0, height * 0.26, 0.18]}>
              <planeGeometry args={[0.18, 0.42]} />
              <meshBasicMaterial color={PALETTE.tabletRune} transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function MountainBackdrop() {
  return (
    <group position={SCENE_ANCHORS.mountain}>
      <mesh castShadow>
        <coneGeometry args={[7.1, 9.2, 7]} />
        <meshStandardMaterial color={PALETTE.mountain} flatShading />
      </mesh>
      <mesh position={[-1.8, -0.3, 1.2]} rotation={[0, 0.4, 0]} castShadow>
        <coneGeometry args={[3.5, 4.8, 7]} />
        <meshStandardMaterial color="#343d4a" flatShading />
      </mesh>
    </group>
  );
}

function TrailheadMarker() {
  return (
    <group position={[SCENE_ANCHORS.trailStart[0], 1.06, SCENE_ANCHORS.trailStart[2] + 0.4]}>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.66, 6]} />
        <meshStandardMaterial color={PALETTE.trunk} flatShading />
      </mesh>
      <mesh position={[0, 0.63, 0.04]} castShadow>
        <boxGeometry args={[0.72, 0.34, 0.08]} />
        <meshStandardMaterial color="#d4bc8a" flatShading />
      </mesh>
      <mesh position={[0, 0.63, 0.09]}>
        <planeGeometry args={[0.45, 0.12]} />
        <meshBasicMaterial color="#5c4a37" />
      </mesh>
    </group>
  );
}

type LowPolyEnvironmentProps = {
  tabletsInteractiveEnabled: boolean;
  tabletsHovered: boolean;
  onTabletsHoverChange: (hovered: boolean) => void;
  onTabletsClick: (target: InteractiveTarget) => void;
  tabletsRef: RefObject<Group | null>;
};

export function LowPolyEnvironment({
  tabletsInteractiveEnabled,
  tabletsHovered,
  onTabletsHoverChange,
  onTabletsClick,
  tabletsRef
}: LowPolyEnvironmentProps) {
  return (
    <group>
      <mesh position={[0, -0.25, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[60, 32]} />
        <meshStandardMaterial color="#274431" flatShading />
      </mesh>

      <mesh rotation={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[6.8, 7.9, 2.2, 8]} />
        <meshStandardMaterial color={PALETTE.islandSide} flatShading />
      </mesh>

      <mesh position={[0, 1.12, 0]} rotation={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[6.95, 8.05, 0.25, 8]} />
        <meshStandardMaterial color={PALETTE.islandTop} flatShading />
      </mesh>

      <mesh position={SCENE_ANCHORS.trailEnd} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.2, 34]} />
        <meshStandardMaterial color={PALETTE.trail} flatShading />
      </mesh>

      <TrailheadMarker />

      <Tree position={[-3.5, 1.13, -1.4]} scale={1.2} />
      <Tree position={[-0.8, 1.11, -2.7]} scale={1.35} />
      <Tree position={[2.2, 1.08, -2.35]} />
      <Tree position={[-4.2, 1.08, 1.8]} scale={0.95} />

      <mesh position={[2.7, 1.27, -1.65]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={PALETTE.rock} flatShading />
      </mesh>
      <mesh position={[-2.2, 1.22, 2.2]} scale={[1.2, 1.1, 1.4]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.54, 0]} />
        <meshStandardMaterial color={PALETTE.rock} flatShading />
      </mesh>

      <group ref={tabletsRef}>
        <StoneTablets
          interactiveEnabled={tabletsInteractiveEnabled}
          hovered={tabletsHovered}
          onHoverChange={onTabletsHoverChange}
          onClick={onTabletsClick}
        />
      </group>
      <MountainBackdrop />
    </group>
  );
}
