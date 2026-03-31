'use client';

import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { Text } from '@react-three/drei';
import type { RefObject } from 'react';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { InteractiveTarget } from './types';
import { EXPERIENCE_ENTRIES } from './experienceData';

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
  detailInteractiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: (target: InteractiveTarget) => void;
  onDetailSelect: (entryId: string) => void;
};

function StoneTablets({ interactiveEnabled, detailInteractiveEnabled, hovered, onHoverChange, onClick, onDetailSelect }: StoneTabletsProps) {
  return (
    <group>
      {EXPERIENCE_ENTRIES.map((entry, index) => {
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
                if (interactiveEnabled || detailInteractiveEnabled) onHoverChange(true);
              }}
              onPointerLeave={(event) => {
                event.stopPropagation();
                onHoverChange(false);
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (interactiveEnabled) onClick('tablets');
                if (detailInteractiveEnabled) onDetailSelect(entry.id);
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
              <planeGeometry args={[0.2, 0.5]} />
              <meshBasicMaterial color={PALETTE.tabletRune} transparent opacity={0.5} />
            </mesh>
            <Text
              position={[0, height * 0.23, 0.181]}
              rotation={[0, 0, 0]}
              fontSize={0.06}
              lineHeight={0.95}
              maxWidth={0.18}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              color="#dfe8e4"
            >
              {entry.tabletLabel}
            </Text>
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
        <meshStandardMaterial color="#2b3443" flatShading />
      </mesh>
    </group>
  );
}

function Clouds() {
  const cloudGroupRef = useRef<Group>(null);
  const cloudOffsets = useMemo(
    () => [0, Math.PI * 0.8, Math.PI * 1.45, Math.PI * 2.15],
    []
  );

  useFrame(({ clock }) => {
    const group = cloudGroupRef.current;
    if (!group) return;
    group.children.forEach((cloud, index) => {
      const offset = cloudOffsets[index] ?? 0;
      const t = clock.getElapsedTime() * 0.06 + offset;
      cloud.position.x = Math.sin(t) * 10.5;
      cloud.position.z = -18.5 + index * 1.9 + Math.cos(t * 0.7) * 1.3;
      cloud.position.y = 6.45 + Math.sin(t * 1.45) * 0.22;
    });
  });

  return (
    <group ref={cloudGroupRef}>
      {cloudOffsets.map((offset, index) => (
        <group key={offset} position={[index * 4.8 - 8.2, 6.5, -19 + index * 2]} scale={[1.2, 0.58, 0.82]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.15, 12, 10]} />
            <meshStandardMaterial color="#edf5ff" flatShading transparent opacity={0.88} />
          </mesh>
          <mesh position={[-1.18, 0.12, 0.12]}>
            <sphereGeometry args={[0.82, 12, 10]} />
            <meshStandardMaterial color="#f7fbff" flatShading transparent opacity={0.9} />
          </mesh>
          <mesh position={[1.12, 0.1, 0.04]}>
            <sphereGeometry args={[0.9, 12, 10]} />
            <meshStandardMaterial color="#e8f1ff" flatShading transparent opacity={0.86} />
          </mesh>
          <mesh position={[0.26, 0.28, 0.08]}>
            <sphereGeometry args={[0.68, 12, 10]} />
            <meshStandardMaterial color="#ffffff" flatShading transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ExperienceEngraving() {
  return (
    <group position={[2.78, 1.126, 3.96]} rotation={[-Math.PI / 2, 0, -0.08]}>
      <mesh receiveShadow>
        <planeGeometry args={[1.44, 0.44]} />
        <meshStandardMaterial color="#28372d" flatShading />
      </mesh>
      <Text
        position={[0, 0.002, 0.01]}
        rotation={[Math.PI, 0, 0]}
        fontSize={0.15}
        letterSpacing={0.03}
        anchorX="center"
        anchorY="middle"
        color="#1a261f"
      >
        Experience
      </Text>
    </group>
  );
}

function TrailheadTimelineSign() {
  return (
    <group position={[1.42, 1.14, 2.42]} rotation={[0, -0.24, 0]}>
      <mesh position={[-0.14, 0.14, 0]} castShadow>
        <boxGeometry args={[0.04, 0.28, 0.04]} />
        <meshStandardMaterial color="#4c382c" flatShading />
      </mesh>
      <mesh position={[0.14, 0.14, 0]} castShadow>
        <boxGeometry args={[0.04, 0.28, 0.04]} />
        <meshStandardMaterial color="#4c382c" flatShading />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.16, 0.04]} />
        <meshStandardMaterial color="#7a5639" flatShading />
      </mesh>
      <Text position={[0, 0.325, 0.026]} fontSize={0.06} anchorX="center" anchorY="middle" color="#f6e5be">
        Timeline
      </Text>
    </group>
  );
}

type LowPolyEnvironmentProps = {
  tabletsInteractiveEnabled: boolean;
  tabletsDetailInteractiveEnabled: boolean;
  tabletsHovered: boolean;
  onTabletsHoverChange: (hovered: boolean) => void;
  onTabletsClick: (target: InteractiveTarget) => void;
  onTabletDetailSelect: (entryId: string) => void;
  tabletsRef: RefObject<Group | null>;
};

export function LowPolyEnvironment({
  tabletsInteractiveEnabled,
  tabletsDetailInteractiveEnabled,
  tabletsHovered,
  onTabletsHoverChange,
  onTabletsClick,
  onTabletDetailSelect,
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

      <ExperienceEngraving />
      <TrailheadTimelineSign />

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
          detailInteractiveEnabled={tabletsDetailInteractiveEnabled}
          hovered={tabletsHovered}
          onHoverChange={onTabletsHoverChange}
          onClick={onTabletsClick}
          onDetailSelect={onTabletDetailSelect}
        />
      </group>
      <Clouds />
      <MountainBackdrop />
    </group>
  );
}
