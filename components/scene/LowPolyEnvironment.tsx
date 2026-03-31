'use client';

import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { Text, useTexture } from '@react-three/drei';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Object3D } from 'three';
import type { Group, InstancedMesh } from 'three';
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
  const [hoveredTabletId, setHoveredTabletId] = useState<string | null>(null);
  const tabletTextures = useTexture(EXPERIENCE_ENTRIES.map((entry) => entry.placeholderImageSrc));

  return (
    <group>
      {EXPERIENCE_ENTRIES.map((entry, index) => {
        const x = SCENE_ANCHORS.tabletsStart[0] + index * 0.62;
        const z = SCENE_ANCHORS.tabletsStart[2] + index * 0.14;
        const height = 1.04;
        const rotationY = -0.11 + index * 0.09;

        return (
          <group key={index} position={[x, SCENE_ANCHORS.tabletsStart[1], z]} rotation={[0, rotationY, 0]}>
            <mesh position={[0, -0.15, -0.02]} castShadow receiveShadow>
              <cylinderGeometry args={[0.24, 0.29, 0.1, 6]} />
              <meshStandardMaterial color="#5a615f" flatShading />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              onPointerEnter={(event) => {
                event.stopPropagation();
                if (interactiveEnabled || detailInteractiveEnabled) {
                  setHoveredTabletId(entry.id);
                  onHoverChange(true);
                }
              }}
              onPointerLeave={(event) => {
                event.stopPropagation();
                setHoveredTabletId((current) => (current === entry.id ? null : current));
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
                color={hoveredTabletId === entry.id ? '#9da3a6' : PALETTE.tablet}
                emissive={hoveredTabletId === entry.id || hovered ? '#49605a' : '#1e2322'}
                emissiveIntensity={hoveredTabletId === entry.id || hovered ? 0.28 : 0.08}
                flatShading
              />
            </mesh>
            <mesh position={[0, height * 0.52, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.14, 0.06, 6]} />
              <meshStandardMaterial color="#95a3a0" flatShading />
            </mesh>
            <mesh position={[0, height * 0.26, 0.18]}>
              <planeGeometry args={[0.2, 0.5]} />
              <meshBasicMaterial
                map={tabletTextures[index]}
                color={hoveredTabletId === entry.id ? '#ffffff' : '#e0e0dd'}
                transparent
                opacity={hoveredTabletId === entry.id ? 0.95 : 0.82}
              />
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
      <mesh castShadow rotation={[0, 0.2, 0]}>
        <coneGeometry args={[6.6, 8.9, 8]} />
        <meshStandardMaterial color={PALETTE.mountain} flatShading />
      </mesh>
      <mesh position={[-2.2, -0.5, 1.6]} rotation={[0, 0.42, 0]} castShadow>
        <coneGeometry args={[4.1, 5.1, 8]} />
        <meshStandardMaterial color="#2b3443" flatShading />
      </mesh>
      <mesh position={[2.8, -0.7, 2.1]} rotation={[0, -0.36, 0]} castShadow>
        <coneGeometry args={[3.8, 4.4, 8]} />
        <meshStandardMaterial color="#344256" flatShading />
      </mesh>
      <mesh position={[0.4, 1.95, 0.2]} scale={[1.1, 0.5, 0.9]} castShadow>
        <dodecahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial color="#7f95ad" flatShading />
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
        <group key={offset} position={[index * 4.8 - 8.2, 6.5, -19 + index * 2]} scale={[1.24, 0.56, 0.86]}>
          <mesh position={[0, 0, 0]}>
            <dodecahedronGeometry args={[1.06, 0]} />
            <meshStandardMaterial color="#edf5ff" flatShading transparent opacity={0.88} />
          </mesh>
          <mesh position={[-1.18, 0.12, 0.12]}>
            <dodecahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial color="#f7fbff" flatShading transparent opacity={0.9} />
          </mesh>
          <mesh position={[1.12, 0.1, 0.04]}>
            <dodecahedronGeometry args={[0.83, 0]} />
            <meshStandardMaterial color="#e8f1ff" flatShading transparent opacity={0.86} />
          </mesh>
          <mesh position={[0.22, 0.3, 0.12]} scale={[0.88, 0.78, 0.9]}>
            <dodecahedronGeometry args={[0.63, 0]} />
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
    <group position={[-.5, 1.2, -5.5]} rotation={[0, 0.22, 0]}>
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

type GrassBlade = {
  x: number;
  z: number;
  scale: number;
  lean: number;
  rotationY: number;
  color: string;
};

function GrassDetail() {
  const denseBladesRef = useRef<InstancedMesh>(null);
  const accentBladesRef = useRef<InstancedMesh>(null);
  const denseBlades = useMemo<GrassBlade[]>(
    () =>
      Array.from({ length: 240 }, (_, index) => {
        const ringMix = (index % 24) / 24;
        const radius = 0.9 + ringMix * 6 + ((index * 13) % 11) * 0.03;
        const angle = (index * 2.399963229728653) % (Math.PI * 2);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const trailGap = Math.abs(x) < 0.78 && z < 0.8 && z > -8.2;
        const tabletGap = z > 2.8 && Math.abs(x) < 3.1;
        const scale = 0.72 + ((index * 7) % 10) * 0.05;
        const lean = (((index * 17) % 15) - 7) * 0.014;
        const colorLightness = 27 + ((index * 19) % 8);

        return {
          x: trailGap || tabletGap ? x * 1.1 : x,
          z: trailGap ? z - 1.4 : z,
          scale,
          lean,
          rotationY: angle + (index % 5) * 0.18,
          color: `hsl(${118 + (index % 7)}, 34%, ${colorLightness}%)`
        };
      }),
    []
  );

  const accentBlades = useMemo<GrassBlade[]>(
    () =>
      Array.from({ length: 72 }, (_, index) => {
        const radius = 1.2 + (index % 9) * 0.58 + ((index * 11) % 7) * 0.06;
        const angle = (index * 1.987) % (Math.PI * 2);
        return {
          x: Math.cos(angle) * radius + ((index % 3) - 1) * 0.1,
          z: Math.sin(angle) * radius + ((index % 4) - 1.5) * 0.12,
          scale: 1 + ((index * 5) % 6) * 0.06,
          lean: (((index * 9) % 11) - 5) * 0.02,
          rotationY: angle + 0.5,
          color: `hsl(${112 + (index % 6)}, 38%, ${31 + (index % 6)}%)`
        };
      }),
    []
  );

  useEffect(() => {
    const denseMesh = denseBladesRef.current;
    const accentMesh = accentBladesRef.current;
    if (!denseMesh || !accentMesh) return;

    const dummy = new Object3D();
    const color = new Color();

    denseBlades.forEach((blade, index) => {
      dummy.position.set(blade.x, 1.17 + (index % 6) * 0.004, blade.z);
      dummy.rotation.set(blade.lean, blade.rotationY, blade.lean * 0.65);
      dummy.scale.setScalar(blade.scale);
      dummy.updateMatrix();
      denseMesh.setMatrixAt(index, dummy.matrix);
      denseMesh.setColorAt(index, color.set(blade.color));
    });
    denseMesh.instanceMatrix.needsUpdate = true;
    if (denseMesh.instanceColor) denseMesh.instanceColor.needsUpdate = true;

    accentBlades.forEach((blade, index) => {
      dummy.position.set(blade.x, 1.175 + (index % 4) * 0.005, blade.z);
      dummy.rotation.set(blade.lean, blade.rotationY, -blade.lean * 0.7);
      dummy.scale.setScalar(blade.scale * 1.1);
      dummy.updateMatrix();
      accentMesh.setMatrixAt(index, dummy.matrix);
      accentMesh.setColorAt(index, color.set(blade.color));
    });
    accentMesh.instanceMatrix.needsUpdate = true;
    if (accentMesh.instanceColor) accentMesh.instanceColor.needsUpdate = true;
  }, [accentBlades, denseBlades]);

  return (
    <group>
      <instancedMesh ref={denseBladesRef} args={[undefined, undefined, denseBlades.length]} castShadow receiveShadow>
        <coneGeometry args={[0.03, 0.2, 5]} />
        <meshStandardMaterial flatShading vertexColors />
      </instancedMesh>
      <instancedMesh ref={accentBladesRef} args={[undefined, undefined, accentBlades.length]} castShadow receiveShadow>
        <coneGeometry args={[0.045, 0.25, 5]} />
        <meshStandardMaterial flatShading vertexColors />
      </instancedMesh>
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
      <mesh position={[-1.3, 1.14, -2.8]} rotation={[0, 0.32, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.9, 0.21, 7]} />
        <meshStandardMaterial color="#365441" flatShading />
      </mesh>
      <mesh position={[2.5, 1.15, 1.7]} rotation={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 2.2, 0.18, 7]} />
        <meshStandardMaterial color="#35513f" flatShading />
      </mesh>
      <GrassDetail />

      <mesh position={SCENE_ANCHORS.trailEnd} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.2, 34]} />
        <meshStandardMaterial color={PALETTE.trail} flatShading />
      </mesh>
      <mesh position={[0.25, 1.035, -6.2]} rotation={[-Math.PI / 2, 0.06, 0]} receiveShadow>
        <planeGeometry args={[0.7, 22]} />
        <meshStandardMaterial color="#66766a" flatShading />
      </mesh>
      <mesh position={[1.38, 1.035, -6.5]} rotation={[-Math.PI / 2, -0.07, 0]} receiveShadow>
        <planeGeometry args={[0.62, 22]} />
        <meshStandardMaterial color="#495b50" flatShading />
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
