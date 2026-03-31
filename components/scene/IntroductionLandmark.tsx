'use client';

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo, useRef } from 'react';
import type { RefObject } from 'react';
import type { Group, MeshStandardMaterial } from 'three';
import { SCENE_ANCHORS } from '@/config/sceneConfig';
import type { InteractiveTarget } from './types';

type IntroductionLandmarkProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: (target: InteractiveTarget) => void;
  landmarkRef: RefObject<Group | null>;
  label?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  reducedMotion: boolean;
};

export const IntroductionLandmark = memo(function IntroductionLandmark({
  interactiveEnabled,
  hovered,
  onHoverChange,
  onClick,
  landmarkRef,
  label = 'Introduction',
  position = SCENE_ANCHORS.introductionLandmark,
  rotation = [0, -0.1, 0],
  scale = 1,
  reducedMotion
}: IntroductionLandmarkProps) {
  const plaqueRef = useRef<MeshStandardMaterial>(null);
  const textGroupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!plaqueRef.current) return;
    if (hovered) {
      plaqueRef.current.emissiveIntensity = 0.14;
      return;
    }
    const pulse = reducedMotion ? 0 : (Math.sin(clock.getElapsedTime() * 2.3) + 1) * 0.5;
    plaqueRef.current.emissiveIntensity = 0.05 + pulse * 0.03;
    if (!textGroupRef.current || reducedMotion) return;
    textGroupRef.current.position.y = 0.36 + Math.sin(clock.getElapsedTime() * 0.72) * 0.012;
  });

  return (
    <group ref={landmarkRef} position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, -0.22, -0.12]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color="#49525a" flatShading />
      </mesh>

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
          if (interactiveEnabled) onClick('introduction');
        }}
      >
        <cylinderGeometry args={[0.56, 0.67, 0.62, 8]} />
        <meshStandardMaterial color={hovered ? '#73808a' : '#5d6872'} flatShading />
      </mesh>

      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.47, 0.56, 0.22, 8]} />
        <meshStandardMaterial color={hovered ? '#8f99a2' : '#77828d'} flatShading />
      </mesh>

      <mesh position={[0.03, 0.06, 0.51]} rotation={[-0.08, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.76, 0.36, 0.08]} />
        <meshStandardMaterial
          ref={plaqueRef}
          color={hovered ? '#909aa3' : '#7b858f'}
          emissive="#2a3237"
          emissiveIntensity={hovered ? 0.14 : 0.07}
          flatShading
        />
      </mesh>

      <group ref={textGroupRef} position={[0.03, 0.36, 0.56]} rotation={[-0.08, 0, 0]}>
        <Text
          fontSize={0.09}
          maxWidth={0.64}
          lineHeight={0.9}
          letterSpacing={0.012}
          anchorX="center"
          anchorY="middle"
          color="#454e55"
        >
          {label}
        </Text>
        <Text
          position={[0.002, 0.003, 0.002]}
          fontSize={0.088}
          maxWidth={0.64}
          lineHeight={0.9}
          letterSpacing={0.011}
          anchorX="center"
          anchorY="middle"
          color={hovered ? '#d8dee1' : '#bec6cb'}
        >
          {label}
        </Text>
      </group>
    </group>
  );
});
