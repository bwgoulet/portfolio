'use client';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo, useRef } from 'react';
import type { RefObject } from 'react';
import type { Group, MeshStandardMaterial } from 'three';
import { SCENE_ANCHORS } from '@/config/sceneConfig';
import type { InteractiveTarget } from './types';

const setInteractiveCursor = (isPointer: boolean) => {
  document.body.style.cursor = isPointer ? 'pointer' : 'auto';
};

type IntroductionLandmarkProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: (target: InteractiveTarget) => void;
  landmarkRef: RefObject<Group | null>;
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
  position = SCENE_ANCHORS.introductionLandmark,
  rotation = [0, -0.1, 0],
  scale = 1,
  reducedMotion
}: IntroductionLandmarkProps) {
  const topStoneRef = useRef<MeshStandardMaterial>(null);
  const engravingGroupRef = useRef<Group>(null);
  const introTexture = useTexture('/introimage.png');

  useFrame(({ clock }) => {
    if (!topStoneRef.current) return;
    if (hovered) {
      topStoneRef.current.emissiveIntensity = 0.14;
      return;
    }
    const pulse = reducedMotion ? 0 : (Math.sin(clock.getElapsedTime() * 2.3) + 1) * 0.5;
    topStoneRef.current.emissiveIntensity = 0.05 + pulse * 0.03;
    if (!engravingGroupRef.current || reducedMotion) return;
    engravingGroupRef.current.position.y = 0.498 + Math.sin(clock.getElapsedTime() * 0.72) * 0.006;
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
          if (interactiveEnabled) {
            onHoverChange(true);
            setInteractiveCursor(true);
          }
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHoverChange(false);
          setInteractiveCursor(false);
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
        <meshStandardMaterial
          ref={topStoneRef}
          color={hovered ? '#8f99a2' : '#77828d'}
          emissive="#2a3237"
          emissiveIntensity={hovered ? 0.14 : 0.07}
          flatShading
        />
      </mesh>

      <group ref={engravingGroupRef} position={[0, 0.498, 0]}>
        <mesh position={[-0.16, 0, 0]} rotation={[-Math.PI / 2, 0.24, 0]}>
          <planeGeometry args={[0.24, 0.16]} />
          <meshStandardMaterial map={introTexture} roughness={0.9} metalness={0.03} />
        </mesh>

        <group position={[0.12, -0.005, -0.005]} rotation={[0, 0.24, 0]}>
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[0.2, 0.006, 0.014]} />
            <meshStandardMaterial color="#5a646f" roughness={1} metalness={0} />
          </mesh>
          <mesh position={[0.01, 0, -0.016]}>
            <boxGeometry args={[0.17, 0.006, 0.014]} />
            <meshStandardMaterial color="#5a646f" roughness={1} metalness={0} />
          </mesh>
          <mesh position={[-0.004, 0, 0.018]}>
            <boxGeometry args={[0.19, 0.006, 0.014]} />
            <meshStandardMaterial color="#5a646f" roughness={1} metalness={0} />
          </mesh>
          <mesh position={[0.015, 0, 0.05]}>
            <boxGeometry args={[0.15, 0.006, 0.014]} />
            <meshStandardMaterial color="#5a646f" roughness={1} metalness={0} />
          </mesh>
        </group>
      </group>
    </group>
  );
});
