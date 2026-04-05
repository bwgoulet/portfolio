'use client';

import { Text, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { memo, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { ClampToEdgeWrapping, DoubleSide, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import type { Group, MeshStandardMaterial } from 'three';
import { ISLAND_GROUND_INTERACTION_MIN_Y, SCENE_ANCHORS } from '@/config/sceneConfig';
import type { InteractiveTarget } from './types';

const setInteractiveCursor = (isPointer: boolean) => {
  document.body.style.cursor = isPointer ? 'pointer' : 'auto';
};

const isAboveIslandGround = (worldY: number) => worldY >= ISLAND_GROUND_INTERACTION_MIN_Y;

type IntroductionLandmarkProps = {
  interactiveEnabled: boolean;
  hoverEnabled?: boolean;
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
  hoverEnabled = interactiveEnabled,
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
  const sideLabelRef = useRef<Group>(null);
  const introTexture = useTexture('/introimage.png');
  const gl = useThree((state) => state.gl);
  const imageWidth = 0.2;
  const imageHeight = imageWidth / (858 / 1356);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    introTexture.colorSpace = SRGBColorSpace;
    introTexture.minFilter = LinearMipmapLinearFilter;
    introTexture.anisotropy = maxAnisotropy;
    introTexture.wrapS = ClampToEdgeWrapping;
    introTexture.wrapT = ClampToEdgeWrapping;
    introTexture.needsUpdate = true;
  }, [gl, introTexture]);

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
    if (!sideLabelRef.current) return;
    sideLabelRef.current.position.y = 0.36 + Math.sin(clock.getElapsedTime() * 0.72) * 0.012;
  });

  return (
    <group ref={landmarkRef} position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, -0.22, -0.12]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color="#49525a" flatShading />
      </mesh>

      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.56, 0.67, 0.62, 8]} />
        <meshStandardMaterial color={hovered ? '#73808a' : '#5d6872'} flatShading />
      </mesh>

      <mesh
        position={[0, 0.12, 0]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (!isAboveIslandGround(event.point.y)) {
            onHoverChange(false);
            setInteractiveCursor(false);
            return;
          }
          if (!hoverEnabled) return;
          onHoverChange(true);
          setInteractiveCursor(true);
        }}
        onPointerMove={(event) => {
          event.stopPropagation();
          if (!isAboveIslandGround(event.point.y)) {
            onHoverChange(false);
            setInteractiveCursor(false);
            return;
          }
          if (!hoverEnabled) return;
          onHoverChange(true);
          setInteractiveCursor(true);
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHoverChange(false);
          setInteractiveCursor(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (!isAboveIslandGround(event.point.y)) {
            setInteractiveCursor(false);
            return;
          }
          setInteractiveCursor(false);
          if (interactiveEnabled) onClick('introduction');
        }}
      >
        <cylinderGeometry args={[0.62, 0.72, 0.98, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
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
        <mesh position={[-0.16, 0.004, 0.005]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[imageWidth, imageHeight]} />
          <meshBasicMaterial
            map={introTexture}
            side={DoubleSide}
            toneMapped={false}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>

        <group position={[0.12, -0.005, -0.005]} rotation={[0, 0.08, 0]}>
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

      <group ref={sideLabelRef} position={[0.03, 0.36, 0.56]} rotation={[-0.08, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.76, 0.22, 0.07]} />
          <meshStandardMaterial color={hovered ? '#909aa3' : '#7b858f'} flatShading />
        </mesh>
        <Text
          position={[0, 0, 0.039]}
          fontSize={hovered ? 0.097 : 0.09}
          maxWidth={0.64}
          lineHeight={0.9}
          letterSpacing={hovered ? 0.015 : 0.012}
          anchorX="center"
          anchorY="middle"
          color={hovered ? '#f5f8fb' : '#dce3e8'}
          fontWeight={hovered ? '700' : '500'}
          outlineWidth={hovered ? 0.01 : 0.006}
          outlineColor={hovered ? '#2f3840' : '#374149'}
        >
          Introduction
        </Text>
      </group>
    </group>
  );
});
